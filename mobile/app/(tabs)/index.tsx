import React, { useRef, useState, useEffect, use } from 'react';
import { io, Socket } from "socket.io-client";
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Home from '../../components/screens/Home';
import QRscan from '../../components/screens/QRscan';
import Name from '../../components/screens/Name';
import Onboarding from '../../components/screens/Onboarding';
import Tuto from '../../components/screens/Tuto';
import Configurator from '../../components/screens/Configurator'
import TransitionOverlay, { TransitionOverlayRef } from '../../components/ui/TransitionOverlay';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';

SplashScreen.preventAutoHideAsync();

const SOCKET_URL = "http://172.20.10.4:4000/";

export default function App() {
  const [fontsLoaded] = useFonts({
    MillingTrial: require("../../assets/fonts/MillingTrial15.otf"),
    MillingTrialBold: require("../../assets/fonts/MillingTrial2.otf"),
    OpenRunde: require("../../assets/fonts/OpenRunde-Regular.otf"),
    OpenRundeBold: require("../../assets/fonts/OpenRunde-Bold.otf"),
    OpenRundeMedium: require("../../assets/fonts/OpenRunde-Medium.otf"),
    OpenRundeSemibold: require("../../assets/fonts/OpenRunde-Semibold.otf"),
  });

  const [videoLoaded, setVideoLoaded] = useState(false);
  useEffect(() => {
    const videoAsset = require("../../assets/videos/dance.mp4");
    const loadVideo = async () => {
      await Asset.loadAsync(videoAsset);
      setVideoLoaded(true);
    };
    loadVideo();
  }, []);


  const [currentView, setCurrentView] = useState<'home' | 'name' | 'qrscan' | 'onboarding' | 'tuto' | 'configurator'>('home');
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const [socket, setSocket] = useState<Socket | null>(null);

  const transitionRef = useRef<TransitionOverlayRef | null>(null);
  const [isModelAppear, setIsModelAppear] = useState(false);


  useEffect(() => {
    if (videoLoaded && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [videoLoaded, fontsLoaded]);
  

  const leaveSession = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      console.log("Déconnecté du Socket et quitté la session");
    }
    if (global.location) {
      global.location.reload();
    }
  };

  useEffect(() => {
    if (roomId && !socket) {
        console.log("Initialisation du Socket...");
        const newSocket = io(SOCKET_URL, {
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("Socket.io connecté (depuis App)");
            newSocket.emit("join-room", roomId);
            console.log(`Rejoint la room: ${roomId}`);
        });

        if (userName) {
          newSocket.emit("user-joined", {
            roomId,
            userName,
          });
          console.log("Username envoyé:", userName);
        }

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }
  }, [roomId]);

  if (!fontsLoaded) {
    return null;
  }


  const switchViewWithTransition = (nextView: typeof currentView) => {
    transitionRef.current?.play(() => {
      setCurrentView(nextView);

      if (nextView === 'configurator') {
        setTimeout(() => {
          setIsModelAppear(true);
        }, 2200);
      }
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStart={() => setCurrentView('name')} />;
      
      case 'name':
        return <Name 
              onComplete={(name) => { setUserName(name); 
                setTimeout(() => {
                  setCurrentView('qrscan'); 
                }, 500);
              }} 
            />

      case 'qrscan':
        return <QRscan
          onComplete={(roomId) => {
            setRoomId(roomId);
            setTimeout(() => {
              setCurrentView('onboarding');
            }, 500);
          }}
        />

      case 'onboarding':
        return <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { leaveSession() })}><Image source={require("../../assets/icons/leave.png")} style={styles.leaveIcon} /><Text style={styles.buttonText}>Quitter la session</Text></TouchableOpacity>
            <View style={styles.componentContainer}>
              <ImageBackground source={require("../../assets/img/bg.png")} resizeMode="cover" style={styles.componentContainer}>
                <Onboarding 
                  userName={userName}
                  onComplete={() => {
                    setTimeout(() => {
                      setCurrentView('tuto'); 
                    }, 500);
                  }}
                />
              </ImageBackground>
            </View>
          </View>

      case 'tuto':
        return <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { leaveSession() })}><Image source={require("../../assets/icons/leave.png")} style={styles.leaveIcon} /><Text style={styles.buttonText}>Quitter la session</Text></TouchableOpacity>
            <View style={styles.componentContainer}>
              <ImageBackground source={require("../../assets/img/bg.png")} resizeMode="cover" style={styles.componentContainer}>
                <Tuto userName={userName} onComplete={() => { switchViewWithTransition('configurator'); }} />
              </ImageBackground>
            </View>
          </View>

      case 'configurator':
        if (!userName || !roomId || !socket) return null;
        return <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { leaveSession() })}><Image source={require("../../assets/icons/leave.png")} style={styles.leaveIcon} /><Text style={styles.buttonText}>Quitter la session</Text></TouchableOpacity>
            <View style={styles.componentContainerConfig}>
              <ImageBackground source={require("../../assets/img/bg.png")} resizeMode="cover" style={styles.componentContainerConfig}>
                <Configurator key={roomId} userName={userName} roomId={roomId} socket={socket} isModelAppear={isModelAppear}/>
              </ImageBackground>
            </View>
          </View>

      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}
      <TransitionOverlay ref={transitionRef} />
    </>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#17161D', 
    padding: 0, 
    paddingTop: 90,
    position: 'relative', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    position: 'relative',
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#908F8C',
    fontSize: 14,
  },
  componentContainer: { 
    backgroundColor: '#F4F3EF',
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    overflow: 'hidden',
    paddingTop: 0,
    marginTop: 0,
  },
  componentContainerConfig: { 
    backgroundColor: '#F4F3EF',
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    overflow: 'visible',
    paddingTop: 0,
    marginTop: 0,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  leaveIcon: {
    width: 18,
    height: 18,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#908F8C',
    fontSize: 16,
  },
  
});
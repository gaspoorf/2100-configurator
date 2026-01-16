import React, { useRef, useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client";
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

import Home from '../../components/screens/Home';
import QRscan from '../../components/screens/QRscan';
import Name from '../../components/screens/Name';
import Onboarding from '../../components/screens/Onboarding';
import Tuto from '../../components/screens/Tuto';
import Configurator from '../../components/screens/Configurator'
import TransitionOverlay, { TransitionOverlayRef } from '../../components/transitions/TransitionOverlay';


// const background = require('../../../assets/img/hero.png');

const SOCKET_URL = "http://172.20.10.4:4000/";

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'name' | 'qrscan' | 'onboarding' | 'tuto' | 'configurator'>('home');
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const [socket, setSocket] = useState<Socket | null>(null);

  const transitionRef = useRef<TransitionOverlayRef | null>(null);
  const [isModelAppear, setIsModelAppear] = useState(false);;

  const leaveSession = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      console.log("❌ Déconnecté du Socket et quitté la session");
    }
    setCurrentView('home');
    setRoomId(null);
    setUserName(null);
  };

  useEffect(() => {
    if (roomId && !socket) {
        console.log("🔄 Initialisation du Socket...");
        const newSocket = io(SOCKET_URL, {
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("✅ Socket.io connecté (depuis App)");
            newSocket.emit("join-room", roomId);
            console.log(`📍 Rejoint la room: ${roomId}`);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }
  }, [roomId]);


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
            <TouchableOpacity style={styles.button} onPress={leaveSession}><Image source={require("../../assets/icons/leave.png")} style={styles.leaveIcon} /><Text style={styles.buttonText}>Quitter la session</Text></TouchableOpacity>
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
            <TouchableOpacity style={styles.button} onPress={leaveSession}><Image source={require("../../assets/icons/leave.png")} style={styles.leaveIcon} /><Text style={styles.buttonText}>Quitter la session</Text></TouchableOpacity>
            <View style={styles.componentContainer}>
              <ImageBackground source={require("../../assets/img/bg.png")} resizeMode="cover" style={styles.componentContainer}>
                <Tuto userName={userName} onComplete={() => { switchViewWithTransition('configurator'); }} />
              </ImageBackground>
            </View>
          </View>

      case 'configurator':
        return <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={leaveSession}><Image source={require("../../assets/icons/leave.png")} style={styles.leaveIcon} /><Text style={styles.buttonText}>Quitter la session</Text></TouchableOpacity>
            <View style={styles.componentContainer}>
              <ImageBackground source={require("../../assets/img/bg.png")} resizeMode="cover" style={styles.componentContainer}>
              <Configurator userName={userName} roomId={roomId} socket={socket} isModelAppear={isModelAppear}/>
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
    backgroundColor: '#000000', 
    padding: 0, 
    paddingTop: 25,
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
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  leaveIcon: {
    width: 18,
    height: 18,
  },
  
});
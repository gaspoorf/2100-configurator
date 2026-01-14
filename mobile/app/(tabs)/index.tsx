import React, { useRef, useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client"; // Import socket.io ici
import Home from '../../components/screens/Home';
import QRscan from '../../components/screens/QRscan';
import Onboarding from '../../components/screens/Onboarding';
import Tuto from '../../components/screens/Tuto';
import Configurator from '../../components/screens/Configurator'
import TransitionOverlay from '../../components/transitions/TransitionOverlay';

// On définit l'URL ici
const SOCKET_URL = "http://172.20.10.4:4000/";

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'qrscan' | 'onboarding' | 'tuto' | 'configurator'>('home');
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  // On stocke l'instance du socket ici
  const [socket, setSocket] = useState<Socket | null>(null);

  const transitionRef = useRef<{ play: (onMiddle: () => void) => void } | null>(null);

  // LOGIQUE DE CONNEXION DÉPLACÉE ICI
  useEffect(() => {
    if (roomId && !socket) {
        console.log("🔄 Initialisation du Socket...");
        const newSocket = io(SOCKET_URL, {
            autoConnect: true,
            // query: { roomId } // Optionnel : tu peux passer la room direct ici si ton back le gère
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
  }, [roomId]); // Se déclenche dès que le roomId est set (après le QRScan)


  const switchViewWithTransition = (nextView: typeof currentView) => {
    transitionRef.current?.play(() => {
      setCurrentView(nextView);
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStart={() => setCurrentView('qrscan')} />;
      case 'qrscan':
        return <QRscan
          onComplete={(roomId) => {
            setRoomId(roomId); // Cela va déclencher le useEffect ci-dessus
            setTimeout(() => {
              setCurrentView('onboarding');
            }, 500);
          }}
        />
      case 'onboarding':
        return <Onboarding 
        onComplete={(name) => { setUserName(name); 
          setTimeout(() => {
            setCurrentView('tuto'); 
          }, 500);
        }} />;
      case 'tuto':
        return <Tuto userName={userName} onComplete={(name) => { switchViewWithTransition('configurator'); }} />;
      case 'configurator':
        // On passe le socket déjà connecté au configurateur
        return <Configurator userName={userName} roomId={roomId} socket={socket}/>;
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
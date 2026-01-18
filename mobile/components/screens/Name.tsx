import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';


type Props = {
  onComplete: (userName: string) => void;
};

const ONBOARDING_STEPS = [
  { title: "Étape 1", description: "Comment s'appelle votre héros ?" },
];

export default function Name({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const video = useRef(null);
  const [showContent, setShowContent] = useState(true);


  const handleNext = () => {
      setShowContent(false);
      onComplete(userName);

  };

  return (
    
    <View style={styles.container}>

      {showContent && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.container}>
          

          <Text style={styles.description}>{ONBOARDING_STEPS[step].description}</Text>

  
          <TextInput
            style={styles.input}
            placeholder="Entrer un nom"
            value={userName}
            onChangeText={setUserName}
            placeholderTextColor="#00000050" 
          />

          {showContent && (
            <Animated.View style={styles.videoContainer} entering={FadeIn.delay(300).duration(300)} exiting={FadeOut.duration(300)}>
              <Video
                style={styles.video}
                ref={video}
                source={require('../../assets/videos/dance.mp4')}
                isLooping={true}
                isMuted={true}
                shouldPlay={true}
                resizeMode={ResizeMode.COVER}
                useNativeControls={false}
              />
            </Animated.View >
          )}
      
          </Animated.View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            !userName && step === 0 && styles.buttonDisabled,
          
          ]}
          onPress={handleNext}
          disabled={step === 0 && !userName}
        >
          <Image
            source={require("../../assets/icons/arrow.png")}
            style={styles.buttonArrow}
          />
        </TouchableOpacity>
      </View>
    );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F4F3EF',
    padding: 0,
    paddingTop: 120,
    justifyContent: 'space-between',
    gap: 20,
  },
  content: { 
    alignItems: 'center', 
    marginTop: 40,
    zIndex: 1, 
  },
  description: { 
    textAlign: 'center', 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#17161D',
    padding: 0,
    letterSpacing: -0.28,
    fontFamily: 'OpenRundeMedium',
  },
  button: { 
    backgroundColor: '#ffffff', 
    paddingVertical: 24, 
    paddingHorizontal: 27, 
    aspectRatio: 1, 
    borderRadius: 100, 
    position: "absolute", 
    bottom: 50, 
    right: 20, 
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    width: 64,
    height: 64,
  },
  buttonDisabled: { 
    backgroundColor: '#ccc',
    opacity: 0.7 
  },
  buttonFinish: { 
    width: '112%', 
    height: 70, 
    borderRadius: 35, 
    aspectRatio: undefined,
  
    alignSelf: 'center',
    position: 'absolute', 
    marginBottom: 0,
    bottom: 50,
  },
  buttonArrow: {
    transform: [{ scale: 0.2 }],
  },
  buttonText: { 
    fontSize: 14,
    color: '#17161D',
    fontFamily: 'OpenRundeMedium',
    letterSpacing: -0.28, 
  },
  input: { 
    padding: 0, 
    width: '100%', 
    marginTop: 0, 
    fontSize: 30, 
    fontWeight: '200', 
    color: '#17161D', 
    textAlign: "center",
    zIndex: 1,
    fontFamily: 'MillingTrial',
    letterSpacing: 0.6,
  },
  videoContainer:{
    flex: 1, 
    alignItems: 'center', 
    padding: 0, 
    paddingVertical: 0,
    position: 'relative',
    width: '100%',
    height: '100%',
    bottom: 0,
  },
  video: {
    bottom: 0,
    position: 'absolute', 
    width: '100%',
    height: '100%',
    zIndex: 0, 
    margin: 0, 
    padding: 0,
  },
});
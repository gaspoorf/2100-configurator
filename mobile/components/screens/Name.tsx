import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, { BounceIn, BounceOut } from 'react-native-reanimated';


type Props = {
  onComplete: (userName: string) => void;
};

const ONBOARDING_STEPS = [
  { title: "Étape 1", description: "Comment s'appelle votre héro ?" },
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

      <Text>{ONBOARDING_STEPS[step].description}</Text>

 
        <TextInput
          style={styles.input}
          placeholder="Entrer un nom"
          value={userName}
          onChangeText={setUserName}
          placeholderTextColor="#00000050" 
        />


      {showContent && (
        <Animated.View style={styles.videoContainer} entering={BounceIn.delay(500).duration(500)} exiting={BounceOut.duration(500)}>
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
      

      <TouchableOpacity
        style={[
          styles.button,
          !userName && step === 0 && styles.buttonDisabled,
        
        ]}
        onPress={handleNext}
        disabled={step === 0 && !userName}
      >
        <Text style={styles.buttonText}>
          {'→'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F4F3EF',
    height: '100%',
    padding: 17,
  },
  content: { 
    alignItems: 'center', 
    marginTop: 40,
    zIndex: 1, 
  },
  description: { 
    textAlign: 'center', 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#000',

    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  buttonText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  input: { 
    borderColor: '#000', 
    padding: 10, 
    width: '100%', 
    marginTop: 20, 
    fontSize: 34, 
    fontWeight: '700', 
    color: '#000', 
    textAlign: "center",
    zIndex: 1,
  },
  videoContainer:{
    flex: 2, 
    alignItems: 'center', 
    padding: 0, 
    paddingVertical: 0,
    position: 'relative',
    bottom: 0,
  },
  video: {
    bottom: 0,
    position: 'absolute', 
    width: '130%',
    height: '100%',
    zIndex: 0, 
  },
});
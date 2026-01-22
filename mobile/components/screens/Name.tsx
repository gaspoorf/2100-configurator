import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions, Keyboard, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, { FadeIn, FadeOut, useSharedValue, withSpring, useAnimatedStyle  } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';

const audioClick = require('../../assets/audio/clickui.wav');

type Props = {
  onComplete: (userName: string) => void;
};

const ONBOARDING_STEPS = [
  { title: "Étape 1", description: "Comment se nome votre héros ?" },
];

export default function Name({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const video = useRef(null);
  const [showContent, setShowContent] = useState(true);
  const keyboardHeight = useSharedValue(0);

  const playerClick = useAudioPlayer(audioClick);

  // btn qui reste en haut du clavier
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        keyboardHeight.value = withSpring(e.endCoordinates.height, {
          damping: 35,
          stiffness: 170,
        });
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardHeight.value = withSpring(0, {
          damping: 35,
          stiffness: 170,
        });
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      bottom: 24 + keyboardHeight.value,
    };
  });


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
            placeholderTextColor="#00000031" 
          />

          {showContent && (
            <Animated.View style={styles.videoContainer} entering={FadeIn.delay(300).duration(300)} exiting={FadeOut.duration(300)}>
              <Video
                style={styles.video}
                ref={video}
                source={require('../../assets/videos/naming.mp4')}
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

        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
          <TouchableOpacity
            style={[
              styles.button,
              !userName && step === 0 && styles.buttonDisabled,
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleNext(), playerClick.play() })}
            disabled={step === 0 && !userName}
          >
            <Image
              source={require("../../assets/icons/arrow.png")}
              style={styles.buttonArrow}
            />
          </TouchableOpacity>
        </Animated.View>
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
    paddingTop: 80,
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
  buttonWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
  },
  button: { 
    backgroundColor: '#ffffff', 
    paddingVertical: 24, 
    paddingHorizontal: 27, 
    aspectRatio: 1, 
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    boxShadow: "-7px 14px 6px rgba(0, 0, 0, 0.02), -4px 8px 5px rgba(0, 0, 0, 0.06), -2px 3px 4px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.12), -11px 21px 7px rgba(0, 0, 0, 0)",
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
    bottom: 50,
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
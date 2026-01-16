import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Animated, Text, Dimensions, Image, StyleSheet } from "react-native";

export type TransitionOverlayRef = {
  play: (onMiddle: () => void, onComplete?: () => void) => void;
};

const TransitionOverlay = forwardRef<TransitionOverlayRef>((props, ref) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useImperativeHandle(ref, () => ({
    play: (onMiddle: () => void, onComplete?: () => void) => {

      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        onMiddle?.();
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => {
            onComplete?.();
          });
        }, 2000);
      });
    },
  }));
  
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { opacity }
      ]}
    >
      <Image
        source={require("../../assets/img/hero.png")}
        style={styles.image}
      />
      <Text>Attend un peu, on installe le décor...</Text>
    </Animated.View>
  );
});

export default TransitionOverlay;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0, left: 0,
    width: "100%",
    height: "110%",
    zIndex: 9999,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  image: {
    width: 132,
    height: 132,
  },
});

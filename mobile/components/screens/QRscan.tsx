import { useCameraPermissions, CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, Pressable, StatusBar, Platform } from "react-native";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type Props = {
    onComplete: (roomId: string) => void;
};

export default function QRScan({ onComplete }: Props) {
  const [permission, requestPermission] = useCameraPermissions();

  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (permission && permission.status === "denied") {
      requestPermission();
    }
  }, [permission]);

  const isGranted = Boolean(permission?.granted);


  if (!permission) {
    return <View style={styles.container} />;
  }

  const handleScan = ({ data }: { data: string }) => {
    if (!data || !showContent) return;
    
    setShowContent(false);
    onComplete(data);
  };
    
  return (
    <View style={styles.container}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      {!isGranted ? (
        <>
          <Text style={styles.info}>Permission caméra nécessaire</Text>
          <Pressable style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Autoriser</Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* {showContent && (
            <Animated.Image
              source={require("../../assets/icons/2100-logo.png")}
              style={styles.image}
              entering={FadeIn.delay(0).duration(300)}
              exiting={FadeOut.duration(300)}
            />
          )} */}

          {showContent && (
            <Animated.Image
              source={require("../../assets/img/qr-code.png")}
              style={styles.imageBG}
              entering={FadeIn.delay(0).duration(300)}
              exiting={FadeOut.duration(300)}
            />

          )}
          
          {showContent && (
            <Animated.View style={styles.cameraContainer} entering={FadeIn.delay(300).duration(300)} exiting={FadeOut.duration(300)}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleScan}
              />
            </Animated.View>
          )}

          {/* <View style={styles.cameraPointer}>
          </View> */}
          
          {showContent && (
            <Animated.Text 
              style={styles.info}
              entering={FadeIn.delay(300).duration(300)}
              exiting={FadeOut.duration(300)}
            >
              Rends-toi sur 2100.fr et scan le QR Code
            </Animated.Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    position: "absolute",
  },
  camera: {
    width: '100%',
    height: '100%',
    overflow: "hidden",
  },
  // cameraPointer: {
  //   width: 223,
  //   height: 223,
  //   borderRadius: 20,
  //   overflow: "hidden",
  //   borderWidth: 2,
  //   borderColor: "white",
  //   position: "relative",
  // },
  info: {
    marginTop: 250,
    color: "#F4F3EF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 300,
    paddingHorizontal: 20,
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 2, 
  },
  image: {
    width: '70%',
    height: 120,
    marginBottom: 25,
    resizeMode: 'contain',
    position: 'relative',
    zIndex: 1,
  }, 
  imageBG: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding:0,
    margin: 0,
    zIndex: 1,
  },
  btn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    backgroundColor: "#F4F3EF",
  },
  btnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
});

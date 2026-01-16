import React, { useState, Suspense, useRef, useCallback } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as THREE from "three";
import {  Socket } from "socket.io-client";
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';
import { Model } from "@/components/three/Model";
import { CameraController, CAMERA_COUNT  } from "@/components/three/CameraController";
import { LinearGradient } from 'expo-linear-gradient';
import { useConfiguratorSocket } from "@/hooks/useSocket";
import Animated, { SlideInDown, FadeOutUp, FadeInDown } from 'react-native-reanimated';


// Sensor 
import { Accelerometer } from 'expo-sensors';
import type { EventSubscription } from 'expo-modules-core';


type Props = {
    userName: string;
    roomId: string;
    socket: Socket | null;
    onTransitionEnd?: () => void;
    isModelAppear: boolean;
};


const { width, height } = Dimensions.get("window");





export default function App({ userName, roomId, socket, onTransitionEnd, isModelAppear  }: Props) {
    const [plane, setPlane] = useState(10);
    const [transport, setTransport] = useState<"100" | "50" | "0" | 0>(0);
    const [promptIA, setPromptIA] = useState<0 | 50 | 100>(0);
    const [energy, setEnergy] = useState<0 | 33 | 66 | 100>(0);
    const [meat, setMeat] = useState(false);
    const [products, setProducts] = useState(5);
    const [phone, setPhone] = useState<"IPhone 17" | "Nokia 3310"| 0>(0);
    const [clothes, setClothes] = useState(5);

    const [isModelAppearDone, setIsModelAppearDone] = useState(false);

    const [isModelTurned, setIsModelTurned] = useState(false);
    const [resultIsShown, setResultIsShown] = useState(false);
    const [feedbackIsShown, setFeedbackIsShown] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Avion", "Transport", "Prompt IA", "Viande", "Produits", "Téléphone", "Energie", "Vêtements"];
    const [camIndex, setCamIndex] = useState(0);



    const {
        isConnected,
        sendReveal,
        sendValidateForm,
        sendCameraMovement,
        sendYearTarget,
        sendShowResult,
        sendCloseResult,
        sendShowExplanations,
        sendChangeQuestion,
        } = useConfiguratorSocket(socket, roomId, {
        plane,
        transport,
        promptIA,
        meat,
        products,
        phone,
        energy,
        clothes,
    });



    // Handlers
    const handlePlaneChange = useCallback((v: number) => {
        setPlane(v);
    }, []);

    const handleTransportChange = useCallback((v: any) => {
        setTransport(v);
    }, []);

    const togglePromptIA = useCallback(() => {
        setPromptIA(prev => prev === 0 ? 50 : prev === 50 ? 100 : 0);
    }, []);

    const toggleMeat = useCallback(() => {
        setMeat(prev => !prev);
    }, []);

    const handleProductsChange = useCallback((v: number) => {
        setProducts(v);
    }, []);

    const handlePhoneChange = useCallback((v: any) => {
        setPhone(v);
    }, []);

    const toggleEnergy = useCallback(() => {
        setEnergy(prev => prev === 0 ? 33 : prev === 33 ? 66 : prev === 66 ? 100 : 0);
    }, [])

    const handleClothesChange = useCallback((v: number) => {
        setClothes(v);
    }, []);

    // Nav
    const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
    
    const nextCam = () => setCamIndex(i => (i + 1) % CAMERA_COUNT);
    const prevCam = () => setCamIndex(i => (i - 1 + CAMERA_COUNT) % CAMERA_COUNT);

    const getQuestionText = () => {
        switch (currentStep) {
            case 0: return `À quelle fréquence ${userName} prend l'avion ? ${Math.round(plane)}`;
            case 1: return `Comment ${userName} se déplace au quotidien ?`;
            case 2: return `À quelle fréquence ${userName} utilise l'Intelligence Artificielle ? ${promptIA}`;
            case 3: return `${userName} mange beaucoup de viande ?`;
            case 4: return `${userName} mange local ? Ou ses produits ont fait 3x le tour du globe avant d'arriver dans son assiette ?`;
            case 5: return `${userName} s'équipe d'un IPhone 17, ou se contente d'un Nokia 3310 ?`;
            case 6: return `À quelle température ${userName} chauffe son logement ?`;
            case 7: return `À quelle fréquence ${userName} achète des vêtements ? ${Math.round(clothes)}`;
            default: return "Configuration terminée";
        }
    };

    const handleFinish = () => {
        nextCam();
        nextStep();
        setIsModelTurned(true);
        
        sendValidateForm(); // VALIDATE_FORM
    };

    const handleFeedbacks = () => {
        setFeedbackIsShown(true);
    };

    const handleResult = () => {
        setFeedbackIsShown(false);
        setResultIsShown(true);
    };

    const closeResult = () => {
        setFeedbackIsShown(false);
        setResultIsShown(false);
    };

    return (
        <View style={styles.container}>
            {!isModelTurned && isModelAppearDone &&(
                <Animated.View
                    // SlideInDown
                    entering={FadeInDown.duration(500)}
                    exiting={FadeOutUp.duration(500)}
                    style={styles.animatedHeaderContainer}
                >
                    <LinearGradient
                        colors={['#FCFCFC', '#D1D1D1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientContent}
                    >
                        <Text style={styles.label}>{getQuestionText()}</Text>
                    </LinearGradient>
                </Animated.View>
            )}

            <Image
                source={require("../../assets/img/hero.png")}
                style={styles.image}
            />

            <View style={styles.canvas}>
                <Canvas camera={{ position: [0, 0, 15] }} gl={{ alpha: true }} onCreated={(state) => state.gl.setClearColor(0x000000, 0)}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[0, 20, 30]} intensity={2} />
                    
                    <Suspense fallback={null}>
                        <Model
                            plane={plane}
                            onPlaneChange={handlePlaneChange}
                            transport={transport}
                            onTransportChange={handleTransportChange}
                            meat={meat}
                            onMeatChange={toggleMeat}
                            promptIA={promptIA}
                            onPromptIAChange={togglePromptIA}
                            products={products}
                            onProductsChange={handleProductsChange}
                            phone={phone}
                            onPhoneChange={handlePhoneChange}
                            energy={energy}
                            onEnergyChange={toggleEnergy}
                            clothes={clothes}
                            onClothesChange={handleClothesChange}
                            isModelAppear={isModelAppear}
                            onAppearFinished={() => {
                                setIsModelAppearDone(true);
                            }}
                            isModelTurned={isModelTurned}
                            resultIsShown={resultIsShown}
                            feedbackIsShown={feedbackIsShown}
                            onReveal={sendReveal}
                            onCameraMovement={sendCameraMovement}
                            onYearChange={sendYearTarget}
                        />

                    </Suspense>
                    <CameraController index={camIndex} />
                </Canvas>
            </View> 

            {!isModelTurned && (
                <View style={styles.buttons}>
                    {currentStep > 0 && (
                        <TouchableOpacity onPress={() => { prevCam(); prevStep(); setIsModelTurned(false) }} style={styles.button}>
                            <Text style={styles.buttonText}>←</Text>
                        </TouchableOpacity>
                    )}
                    {currentStep < steps.length - 1 && (
                        <TouchableOpacity onPress={() => { nextCam(); nextStep(); }} style={styles.button}>
                            <Text style={styles.buttonText}>→</Text>
                        </TouchableOpacity>
                    )}
                    {currentStep === steps.length - 1 && (
                        <TouchableOpacity onPress={handleFinish} style={styles.button}>
                            <Text style={styles.buttonText}>Terminer</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}


            {/* Result view */}
            {isModelTurned && (
                <View style={styles.buttons}>
                    {currentStep === steps.length - 1 && (
                        <TouchableOpacity onPress={() => { handleFeedbacks(); sendShowResult(); }} style={styles.button}>
                            <Text style={styles.buttonText}>Voir le résultat</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {isModelTurned && feedbackIsShown && (
                <View style={styles.ResultsPanel}>

                    <TouchableOpacity onPress={() => { closeResult(); sendCloseResult(); }} style={[styles.button, styles.buttonClose]}>
                        <Text style={styles.buttonText}>X</Text>
                    </TouchableOpacity>

                    <Text>Score : F</Text>
                    <Text>$Name n'est pas vraiment protecteur de la planete</Text>

                  


                    <TouchableOpacity onPress={() => { handleResult(); sendShowExplanations(); }} style={styles.button}>
                        <Text style={styles.buttonText}>Comprendre ses erreurs</Text>
                    </TouchableOpacity>

                    <View style={styles.imageResultsContainer}>
                        <Image
                            source={require("../../assets/img/hero.png")}
                            style={styles.imageResults}
                        />
                    </View>

                </View>
            )}


            {isModelTurned && resultIsShown && (
                <View style={styles.ResultsPanel}>

                    <TouchableOpacity onPress={() => { closeResult(); sendCloseResult(); }} style={[styles.button, styles.buttonClose]}>
                        <Text style={styles.buttonText}>X</Text>
                    </TouchableOpacity>
                
                    <View style={styles.questionsRow}>
                        <TouchableOpacity onPress={() => sendChangeQuestion(0)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/plane.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 1</Text>
                        
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => sendChangeQuestion(1)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/transports.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 2</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.questionsRow}>
                        <TouchableOpacity onPress={() => sendChangeQuestion(2)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/ia.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 3</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => sendChangeQuestion(3)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/meat.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 4</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.questionsRow}>
                        <TouchableOpacity onPress={() => sendChangeQuestion(4)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/products.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => sendChangeQuestion(5)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/phone.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 6</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.questionsRow}>
                        <TouchableOpacity onPress={() => sendChangeQuestion(6)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/energy.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 7</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => sendChangeQuestion(7)} style={styles.button}>
                            <Image
                                source={require("../../assets/img/questions/clothes.png")}
                                style={styles.imageQuestion}
                            />
                            <Text style={styles.buttonText}>Question 8</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    canvas: {
        position: "absolute",
        width: width,
        height: height,
        top: 0,
        left: 0,
        zIndex: 0,
        backgroundColor: "transparent",
    },
    container: {
        flex: 1,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        paddingTop: 0,
    },
    animatedHeaderContainer: {
        position: "absolute",
        top: 0,
        width: "100%",
        zIndex: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        paddingHorizontal: 0, 
        marginTop: 20, 
    },
    gradientContent: {
        backgroundColor: '#FCFCFC',
        borderRadius: 24,
        padding: 24,
        paddingTop: 40,
        paddingBottom: 40,
        width: '100%',
    },
    image: {
        width: 250,
        height: 250,
        transform: [{ scale: -1 }],
        position: "absolute",
        top: -123,
        zIndex: 2,
        resizeMode: "contain",
        marginBottom: 10,
    }, 
    imageResultsContainer:{
        flex: 2, 
        alignItems: 'center', 
        padding: 0, 
        paddingVertical: 0,
        bottom: -60,
    },
    imageResults: {
        bottom: 0,
        position: 'absolute', 
        width: '200%',
        height: '100%',
        zIndex: 0, 
    },
    question: {
        color: "#000000",
        opacity: 0.5,
        fontSize: 10,
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center"
    },
    label: {
        color: "#000000",
        fontSize: 20,
        textAlign: "center",
        fontWeight: "700"
    },
    buttons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
        position: "absolute",
        bottom: 50,
        zIndex: 2
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 24,
        paddingHorizontal: 27,
        borderRadius: 100,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 3.84
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },

    buttonClose: {
        position: "absolute",
        top: 20,
        margin : "auto",
        zIndex: 3,
    },
    ResultsPanel: {
        position: "absolute",
        overflow: "hidden",
        top: 0,
        bottom: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        left: 16,
        right: 16,
        width: "100%",
        height: "100%",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 48,
        zIndex: 2,
        gap: 10,
    },
    questionsRow: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    imageQuestion:{
        width: 80,
        height: 80,
    }
});




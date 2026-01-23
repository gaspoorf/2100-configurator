import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
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
import { useAudioPlayer } from 'expo-audio';
import { Video } from 'expo-av';
import Animated, { 
    SlideInDown, 
    FadeOutUp, 
    FadeInUp,
    FadeInDown, 
    FadeIn,
    FadeOut,
    FadeOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';


// Sensor 
import { Accelerometer } from 'expo-sensors';
import type { EventSubscription } from 'expo-modules-core';


const audioAppear = require('../../assets/audio/appear-model.wav');
const audioClick = require('../../assets/audio/clickui.wav');

type Props = {
    userName: string;
    roomId: string;
    socket: Socket | null;
    onTransitionEnd?: () => void;
    isModelAppear: boolean;
};


const { width, height } = Dimensions.get("window");


const getRankImage = (rankPath: string) => {
    const filename = rankPath.split('/').pop();
    
    switch(filename) {
        case 'rank-a.webp':
            return require("../../assets/icons/rank-a.png");
        case 'rank-b.webp':
            return require("../../assets/icons/rank-b.png");
        case 'rank-c.webp':
            return require("../../assets/icons/rank-c.png");
        case 'rank-d.webp':
            return require("../../assets/icons/rank-d.png");
        case 'rank-e.webp':
            return require("../../assets/icons/rank-e.png");
        case 'rank-f.webp':
        default:
            return require("../../assets/icons/rank-f.png");
    }
};



export default function App({ userName, roomId, socket, isModelAppear }: Props) {

    type ConfiguratorState = {
        plane: number;
        transport: 100 | 50 | 0;
        promptIA: 0 | 50 | 100;
        energy: 0 | 33 | 66 | 100;
        meat: 0 | 100;
        products: number;
        phone: 0 | 100;
        clothes: number;
    };

    const INITIAL_STATE: ConfiguratorState = {
        plane: 0,
        transport: 0,
        promptIA: 0,
        energy: 0,
        meat: 0,
        products: 0,
        phone: 0,
        clothes: 0,
    };


    const [plane, setPlane] = useState(INITIAL_STATE.plane);
    const [transport, setTransport] = useState<typeof INITIAL_STATE.transport>(INITIAL_STATE.transport);
    const [promptIA, setPromptIA] = useState<0 | 50 | 100>(INITIAL_STATE.promptIA);
    const [energy, setEnergy] = useState<0 | 33 | 66 | 100>(INITIAL_STATE.energy);
    const [meat, setMeat] = useState<0 | 100>(INITIAL_STATE.meat);
    const [products, setProducts] = useState(INITIAL_STATE.products);
    const [phone, setPhone] = useState<0 | 100>(INITIAL_STATE.phone);
    const [clothes, setClothes] = useState(INITIAL_STATE.clothes);



    const [isModelAppearDone, setIsModelAppearDone] = useState(false);

    const [isModelTurned, setIsModelTurned] = useState(false);
    const [resultIsShown, setResultIsShown] = useState(false);
    const [feedbackIsShown, setFeedbackIsShown] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Avion", "Transport", "Prompt IA", "Viande", "Produits", "Téléphone", "Energie", "Vêtements"];
    const [camIndex, setCamIndex] = useState(0);

    const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
    const [isResetPopupVisible, setIsResetPopupVisible] = useState(false);
    const [localIsModelAppear, setLocalIsModelAppear] = useState(false);

    const [isResultDataLoaded, setIsResultDataLoaded] = useState(false);

    const player = useAudioPlayer(audioAppear);
    const playSound = useCallback(() => {
        player.seekTo(0);
        player.play();
    }, [player]);

    const playerUI = useAudioPlayer(audioClick);
    const playSoundUI = useCallback(() => {
      playerUI.seekTo(0);
      playerUI.play();
    }, [playerUI]);

    useEffect(() => {
        if (isModelAppear && !localIsModelAppear) {
            setTimeout(() => {
                setLocalIsModelAppear(true);
                playSound();
            }, 100);
        }
    }, [isModelAppear, localIsModelAppear]);

    const {
        isConnected,
        resultData,
        sendReveal,
        sendValidateForm,
        sendCameraMovement,
        sendYearTarget,
        sendShowResult,
        sendCloseResult,
        sendShowExplanations,
        sendChangeQuestion,
        sendResetData,
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

    const handleTransportChange = useCallback((v: 0 | 50 | 100) => {
        setTransport(v);
    }, []);

    const togglePromptIA = useCallback(() => {
        setPromptIA(prev => prev === 0 ? 50 : prev === 50 ? 100 : 0);
    }, []);

    const handleMeatChange = useCallback(() => {
        setMeat(prev => (prev === 0 ? 100 : 0));
    }, []);

    const handleProductsChange = useCallback((v: number) => {
        setProducts(v);
    }, []);

    const handlePhoneChange = useCallback((v: 0 | 100) => {
        setPhone(v);
    }, []);

    const toggleEnergy = useCallback(() => {
        setEnergy(prev => prev === 0 ? 33 : prev === 33 ? 66 : prev === 66 ? 100 : 0);
    }, [])

    const handleClothesChange = useCallback((v: number) => {
        setClothes(v);
    }, []);

    const handleQuestionClick = (index: number) => {
        setActiveQuestion(index);
        sendChangeQuestion(index);
    };

    // Nav
    const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
    
    const nextCam = () => setCamIndex(i => (i + 1) % CAMERA_COUNT);
    const prevCam = () => setCamIndex(i => (i - 1 + CAMERA_COUNT) % CAMERA_COUNT);

    const getQuestionText = () => {
        switch (currentStep) {
            case 0: return `À quelle fréquence ${userName} prend l'avion dans l'année ?`;
            case 1: return `Comment ${userName} se déplace au quotidien ?`;
            case 2: return `À quelle fréquence ${userName} utilise l'Intelligence Artificielle ?`;
            case 3: return `${userName} mange beaucoup de viande ?`;
            case 4: return `${userName} mange local ? Ou ses produits ont fait 3x le tour du globe avant d'arriver dans son assiette ?`;
            case 5: return `${userName} s'équipe d'un IPhone 17, ou se contente d'un Nokia 3310 ?`;
            case 6: return `À quelle température ${userName} chauffe son logement ?`;
            case 7: return `À quelle fréquence ${userName} achète des vêtements ?`;
            default: return "Configuration terminée";
        }
    };

    const handleFinish = () => {
        nextCam();
        nextStep();
        setIsModelTurned(true);
        playSound();
        sendValidateForm(); // VALIDATE_FORM
    };

    const handleFeedbacks = () => {
        setIsResultDataLoaded(false);
        sendShowResult();
    };

    useEffect(() => {
        if (resultData && !isResultDataLoaded) {
            setIsResultDataLoaded(true);
            setFeedbackIsShown(true);
        }
    }, [resultData, isResultDataLoaded]);

    const handleResult = () => {
        setFeedbackIsShown(false);
        setResultIsShown(true);
    };

    const closeResult = () => {
        setFeedbackIsShown(false);
        setResultIsShown(false);
    };

    const handleResetClick = () => {
        setIsResetPopupVisible(true);
    };

    const closeResetPopup = () => {
        setIsResetPopupVisible(false);
    };
    

    const resetConfiguration = () => {
        setPlane(INITIAL_STATE.plane);
        setTransport(INITIAL_STATE.transport);
        setPromptIA(INITIAL_STATE.promptIA);
        setEnergy(INITIAL_STATE.energy);
        setMeat(INITIAL_STATE.meat);
        setProducts(INITIAL_STATE.products);
        setPhone(INITIAL_STATE.phone);
        setClothes(INITIAL_STATE.clothes);
        setCurrentStep(0);
        setCamIndex(0);
        setIsModelTurned(false);
        setResultIsShown(false);
        setFeedbackIsShown(false);
        setActiveQuestion(null);
        setIsModelAppearDone(true);
        setLocalIsModelAppear(false);

        setTimeout(() => setLocalIsModelAppear(true), 50);

        setIsResetPopupVisible(false);
        sendResetData();
    };

    return (
        <View style={styles.container}>
            {!isModelTurned && localIsModelAppear &&(
                <Animated.View
                    // SlideInDown
                    entering={FadeInUp.duration(300).delay(1000)}
                    exiting={FadeOutDown.duration(300)}
                    style={styles.animatedHeaderContainer}
                >
                    <LinearGradient
                        colors={['#FCFCFC', '#D1D1D1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientContent}
                    >
                        <Animated.Text
                            key={currentStep}
                            entering={FadeIn.duration(200).delay(100)}
                            exiting={FadeOut.duration(200)}
                            style={styles.label}
                        >
                            {getQuestionText()}
                        </Animated.Text>
                    </LinearGradient>
                </Animated.View>
            )}

            <View style={styles.imageContainer}>
                <Image
                    source={require("../../assets/img/hero-return.png")}
                    style={styles.image}
                />
            </View>
            

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
                            onMeatChange={handleMeatChange}
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
                            isModelAppear={localIsModelAppear}
                            onAppearFinished={() => {
                                setIsModelAppearDone(true);
                            }}
                            isModelTurned={isModelTurned}
                            resultIsShown={resultIsShown}
                            feedbackIsShown={feedbackIsShown}
                            onCameraMovement={sendCameraMovement}
                            onYearChange={sendYearTarget}
                            onResetClick={handleResetClick}
                        />

                    </Suspense>
                    <CameraController index={camIndex} />
                </Canvas>
            </View> 

            {!isModelTurned && (
                <View style={styles.buttons}>
                    {currentStep > 0 && (
                        <TouchableOpacity onPress={() => { prevCam(); prevStep(); setIsModelTurned(false); playSoundUI(); }} style={styles.button}>
                            <Image
                                source={require("../../assets/icons/arrow.png")}
                                style={[styles.buttonArrow, { transform: [{ rotate: '180deg'}, { scale: 0.2 }] }]}
                            />
                            
                        </TouchableOpacity>
                    )}
                    {currentStep < steps.length - 1 && (
                        <TouchableOpacity onPress={() => { nextCam(); nextStep(); sendReveal(); playSoundUI();}} style={styles.button}>
                            <Image
                                source={require("../../assets/icons/arrow.png")}
                                style={styles.buttonArrow}
                            />
                        </TouchableOpacity>
                    )}
                    {currentStep === steps.length - 1 && (
                        <TouchableOpacity onPress={handleFinish} style={[styles.button, { width: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingLeft: 50 }]} >
                            <Text style={styles.buttonText}>Découvrir le monde</Text> 
                            <Image
                                source={require("../../assets/icons/stars.png")}
                                style={styles.buttonStars}
                            />
                        </TouchableOpacity>
                    )}
                </View> 
            )}


            {/* Result view */}
            {isModelTurned && (
                <View style={styles.buttons}>
                    {currentStep === steps.length - 1 && (

                        <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() =>{handleFeedbacks(); sendShowResult(); playSoundUI();})} style={[styles.button, { width: 'auto'}]}>
                            <Text style={styles.buttonText}>Voir le résultat de {userName}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {isModelTurned && feedbackIsShown && (
                <Animated.View entering={FadeIn.duration(400)} exiting={FadeOutDown.duration(300)} style={styles.ResultsPanel}>

                    <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() =>{closeResult(); sendCloseResult(); playSoundUI();})} style={[styles.button, styles.buttonClose]}>
                        <Image
                            source={require("../../assets/icons/close.png")}
                            style={styles.buttonCloseIcon}
                        />
                    </TouchableOpacity>

                    <View style={{overflow: 'hidden', flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20, borderBottomLeftRadius: 48, borderBottomRightRadius: 48}}>

                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{flexDirection: 'column', alignItems: 'center', marginTop: 80, gap: 0}}>
                            <Animated.Image
                                entering={FadeInDown.delay(150).duration(350)}
                                source={getRankImage(resultData?.rank || '/icons/rank-f.png')}
                                style={{ width: 90, height: 90, transform: [{ rotate: '-8.8deg' }], }}
                                resizeMode="contain"
                            />
                            <Animated.Text entering={FadeInDown.delay(250).duration(400)} style={styles.feedbackText}>
                                {resultData?.text ? resultData.text.replace('%Name', userName) : `Données indisponibles pour le moment`}
                            </Animated.Text>
                        </Animated.View>
                    
                        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.buttonExplanations}>
                            <TouchableOpacity  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() =>{handleResult(); sendShowExplanations(); playSoundUI();})} style={[styles.button, { width: 'auto'}]}>
                                <Text style={styles.buttonText}>Comprendre ses erreurs</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View entering={FadeIn.delay(300)} style={styles.imageResultsContainer}>
                            <Video
                                source={require("../../assets/videos/results.mp4")}
                                style={styles.imageResults}
                                isLooping={true}
                                isMuted={true}
                                shouldPlay={true}
                                useNativeControls={false}
                            />
                        </Animated.View>
                    </View>



                </Animated.View>
            )}           
           
            {isModelTurned && resultIsShown && (
                <Animated.View entering={FadeIn.duration(400)} exiting={FadeOutUp.duration(300)} style={styles.ResultsPanel}>

                    <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() =>{closeResult(); sendCloseResult(); playSoundUI();})}  style={[styles.button, styles.buttonClose]}>
                        <Image
                            source={require("../../assets/icons/close.png")}
                            style={styles.buttonCloseIcon}
                        />
                    </TouchableOpacity>
                
                    <Animated.View entering={FadeInDown.delay(100)} style={styles.questionsRow}>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 0 && { opacity: 1 },
                                activeQuestion !== 0 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(0); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 0 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/plane.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 1</Text>
                        </View>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 1 && { opacity: 1 },
                                activeQuestion !== 1 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(1); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 1 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/transports.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 2</Text>
                        </View>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.questionsRow}>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 2 && { opacity: 1 },
                                activeQuestion !== 2 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(2); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 2 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/ia.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 3</Text>
                        </View>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 3 && { opacity: 1 },
                                activeQuestion !== 3 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(3); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 3 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/meat.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 4</Text>
                        </View>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(300)} style={styles.questionsRow}>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 4 && { opacity: 1 },
                                activeQuestion !== 4 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(4); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 4 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/products.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 5</Text>
                        </View>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 5 && { opacity: 1 },
                                activeQuestion !== 5 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(5); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 5 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/phone.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 6</Text>
                        </View>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(400)} style={styles.questionsRow}>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 6 && { opacity: 1 },
                                activeQuestion !== 6 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(6); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 6 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/energy.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 7</Text>
                        </View>
                        <View
                            style={[
                                styles.questionsContainer,
                                activeQuestion === 7 && { opacity: 1 },
                                activeQuestion !== 7 && { opacity: 0.7 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleQuestionClick(7); playSoundUI(); })}
                                style={[
                                    styles.button,
                                    styles.buttonQuestion,
                                    activeQuestion === 7 && styles.buttonQuestionActive,
                            ]}
                            >
                                <Image
                                    source={require("../../assets/img/questions/clothes.png")}
                                    style={styles.imageQuestion}
                                />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Question 8</Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            )}

            {isModelTurned && (feedbackIsShown || resultIsShown) && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOutUp.duration(200)} style={styles.overlay} />
            )}

            {/* Reset Popup */}
            {isResetPopupVisible && (
                <Animated.View style={styles.popupContainer} entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                    <Animated.View style={styles.popupContent} entering={FadeIn.duration(300)} exiting={FadeOutUp.duration(200)}>
                        <Text style={styles.popupText}>On fait comme si rien ne s'était passé ?</Text>
                        <Text style={styles.popupDescription}>La planète n'aura aucun souvenir de ce que tu viens de répondre. </Text>

                        <View style={styles.popupButtons}>
                            <TouchableOpacity onPress={() => { closeResetPopup() ; resetConfiguration(); playSoundUI(); }} style={styles.popupButton}>
                                <Text style={styles.popupButtonText}>Oui, on recommence</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { closeResetPopup(); playSoundUI(); }} style={styles.popupCloseButton}>
                                <Text style={styles.popupButtonText}>Oups, finalement non</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </Animated.View>
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
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        overflow: "hidden",
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
    imageContainer: {
        borderColor: "red",
        borderWidth: 0,
        width: 200,
        height: 53,
        position: "absolute",
        top: 0,
        zIndex: 1,
        overflow: "hidden",
    },
    image: {
        width:'100%',
        height: '100%',
        transform: [{ scale: 7 }],
        top: -28,
        position: 'absolute',
        
        resizeMode: "contain",
    }, 
    imageResultsContainer:{
        flex: 2, 
        alignItems: 'center', 
        padding: 0, 
        paddingVertical: 0,
        bottom: 0,
        position: 'absolute', 
        width: '115%',
        height: '65%',
        zIndex: -1,
    },

    imageResults: {
        bottom: 0,
        position: 'absolute',
        width: '100%',
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
        fontSize: 20,
        textAlign: "center",
        fontWeight: 200,
        color: "#17161D",
        lineHeight: 21,
        fontFamily: "MillingTrial",
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
        shadowRadius: 3.84,
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonArrow: {
        transform: [{ scale: 0.2 }],
    },
    buttonStars: {
        transform: [{ scale: 0.2 }],
        padding: 0,
        marginLeft: -25,
        marginRight: 0,
    },
    buttonCloseIcon: {
        transform: [{ scale: 0.3 }],
        padding: 0,
        margin: 0,
    },
    buttonClose: {
        padding: 0,
        margin: 0,
        position: "absolute",
        top: -28,
        zIndex: 10,        
    },
    buttonText: {
        fontSize: 14,
        color: '#17161D',
        fontFamily: 'OpenRundeMedium',
        letterSpacing: -0.28,
        padding: 0,
        margin: 0,
        lineHeight: 16,
    },
    ResultsPanel: {
        position: "absolute",
        // overflow: "hidden",
        top: -35,
        bottom: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        left: 16,
        right: 16,
        width: "100%",
        height: "103%",
        padding: 0,
        backgroundColor: "#F4F3EF",
        borderRadius: 48,
        zIndex: 2,
        gap: 30,
    },
    buttonExplanations: {
        position: "absolute",
        bottom: 16,
        zIndex: 2,
    },
    feedbackText: {
        textAlign: 'center',
        fontSize: 24,
        lineHeight: 26.4,
        color: '#17161D',
        fontFamily: 'MillingTrial',
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    questionsRow: {
        display: "flex",
        flexDirection: "row",
        gap: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonQuestion: {
        backgroundColor: 'transparent',
        width: 96,
        height: 96,
        borderRadius: 16,
        transform: [{ rotate: '-5deg' }],
        
    },
    buttonQuestionActive: {
        backgroundColor: '#f5f3f3ff',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    },
    questionsContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        opacity: 1,
        backgroundColor: "transparent",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    questionsContainerActive: {
        opacity: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    imageQuestion:{
        width: 80,
        height: 80,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 1,
    },
    popupContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3,
    },
    popupContent: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 24,
        paddingTop: 40,
        paddingBottom: 32,
        paddingHorizontal: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    popupText: {
        fontSize: 24,
        color: "#17161D",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 26.4,
        fontFamily: "MillingTrial",
    },
    popupDescription: {
        fontSize: 14,
        textAlign: "center",
        color: "#908F8C",
        letterSpacing: -0.28,
        marginBottom: 30,
    },
    popupButtons: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        width: "100%",
    },
    popupButton: {
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
        shadowRadius: 3.84,
        width: '100%',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupCloseButton: {
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    popupButtonText: {
        fontSize: 16,
        color: "#17161D",
    },
});




import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
    SlideInRight, 
    SlideOutLeft, 
    SlideInLeft, 
    SlideOutRight, 
    FadeIn,
    FadeInDown,
    BounceIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';


type Props = {
    userName: string | null;
    onComplete: () => void;
};

const TUTO_STEPS = [
    { title: "Joue avec les boutons pour faconner ton monde", description: "" },
    { title: "Modifie tes choix quand tu veux (le destin se réécrit)", description: "Tu t’es trompé ? Tu as changé d’avis ? Pas grave. Tu peux revenir sur n’importe quelle réponse." },
    { title: "", description: "Climat, faune, flore… tout se construit en direct. Prépare-toi à voir ton univers se révéler."},
];

const TUTO_IMG = [
    require("../../assets/img/tuto1.png"),
    require("../../assets/img/tuto2.png"),
    require("../../assets/img/tuto3.png"),
];

export default function Tuto({ userName, onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    const handleNext = () => {
        if (step < TUTO_STEPS.length - 1) {
            setDirection('next');
            setTimeout(() => {
                setStep(prev => prev + 1);
            }, 10);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setDirection('prev');
            setTimeout(() => {
                setStep(prev => prev - 1);
            }, 10);
        }
    };

    const currentContent = {
        ...TUTO_STEPS[step],
        title:
            step === 2
                ? `Regarde l’univers de ${userName ?? ''} se créer sous tes yeux !`
                : TUTO_STEPS[step].title,
        description:
            step === 0
                ? `Chaque question change un petit bout de l’univers de ${userName ?? ''}. Pas de pression : teste, bidouille, amuse-toi.`
                : TUTO_STEPS[step].description,
        
    };

    const enteringAnim =
    (direction === 'next' ? SlideInRight : SlideInLeft)
        .springify()
        .damping(55)
        .stiffness(370);

    const exitingAnim =
        (direction === 'next' ? SlideOutLeft : SlideOutRight)
            .springify()
            .damping(55)
            .stiffness(370);


    
    const StickerEnter = BounceIn    
        .delay(500)        // opacité
        .springify()               // transforme en spring
        .damping(75)               // moins de rebond
        .stiffness(260)


    return (
        <View style={styles.container}>

            <Animated.View 
                key={step}
                entering={enteringAnim}
                exiting={exitingAnim}
                style={styles.slideContainer}
            >

                {step === 0 && (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.stickers1}>
                        <Animated.Image
                            entering={StickerEnter}
                            source={require("../../assets/img/stickers/earth-sticker.png")}
                            style={styles.stickersImg1}
                        />
                    </Animated.View>
                )}

                {step === 1 && ( 
                    <Animated.View entering={FadeIn.duration(300).delay(500)} style={styles.stickers2}>
                        <Animated.Image
                            entering={StickerEnter}
                            source={require("../../assets/img/stickers/btn-sticker.png")}
                            style={styles.stickersImg2}
                        />
                    </Animated.View>
                )}

                {step === 2 && (
                    <Animated.View entering={FadeIn.duration(300).delay(500)} style={styles.stickers3}>
                        <Animated.Image
                            entering={StickerEnter}
                            source={require("../../assets/img/stickers/emoji-sticker.png")}
                            style={styles.stickersImg3}
                        />
                    </Animated.View>
                )}

                
                <Image
                    source={TUTO_IMG[step]}
                    style={styles.image}
                />

                <View style={styles.content} >
                    <Animated.Text style={styles.title} entering={FadeInDown.duration(300).delay(500)}>{currentContent.title}</Animated.Text>
                    <Animated.Text style={styles.description} entering={FadeInDown.duration(300).delay(570)}>{currentContent.description}</Animated.Text>
                </View>

            </Animated.View>


          
            <View style={styles.buttons}>

                {step === 0 && (
                    <TouchableOpacity
                        style={[styles.button, styles.button]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleNext() })}
                    >
                        <Image
                            source={require("../../assets/icons/arrow.png")}
                            style={styles.buttonArrow}
                        />
                    </TouchableOpacity>
                )}

                {step > 0 && (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.button]}
                            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handlePrev() })}
                        >
                            <Image
                                source={require("../../assets/icons/arrow.png")}
                                style={[styles.buttonArrow, { transform: [{ rotate: '180deg'}, { scale: 0.2 }] }]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.button]}
                            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() => { handleNext() })}
                        >
                            <Image
                                source={require("../../assets/icons/arrow.png")}
                                style={styles.buttonArrow}
                            />
                        </TouchableOpacity>
                    </>
                )}

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
        height: '100%',
        width: '100%',
        padding: 17,
        flex: 1,
    },
    slideContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        marginTop: 30,
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'normal',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: 'MillingTrial',
        lineHeight: 21,
        paddingHorizontal: 40,
    },
    description: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 500,
        color: '#17161D',
        paddingHorizontal: 50 ,
        fontFamily: 'OpenRundeMedium',
        letterSpacing: -0.28,
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        position: "absolute",
        bottom: 52,
        zIndex: 2,
        width: '110%',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#ffffff', 
        paddingVertical: 24, 
        paddingHorizontal: 27, 
        aspectRatio: 1, 
        borderRadius: 100, 
        bottom: 0,
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        width: 64,
        height: 64,
    },
    buttonArrow: {
        transform: [{ scale: 0.2 }],
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonFinish: {
        width: '110%',
        height: 70,
        textAlign: 'center',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.15)",
    },
   
    image: {
        width: '100%',
        borderRadius: 35,
        overflow: 'hidden',
        position: 'relative',
        pointerEvents: 'none',
    },

    stickers1: {
        position: 'absolute',
        top: -22,
        left: -40,
        zIndex: 2,
        transform: [{ rotate: '-15deg' }],
    }, 

    stickers2: {
        position: 'absolute',
        bottom: '37%',
        right: -30,
        zIndex: 2,
        
        transform: [{ rotate: '9deg' }],
    },

    stickers3: {
        position: 'absolute',
        top: '3%',
        left: -30,
        zIndex: 2,
        transform: [{ rotate: '-15deg' }],
    },

    stickersImg1: {
        width: 150,
        height: 80,
        resizeMode: 'contain',
    },

    stickersImg2: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },

     stickersImg3: {
        width: 132,
        height: 132,
        resizeMode: 'contain',
    },

});
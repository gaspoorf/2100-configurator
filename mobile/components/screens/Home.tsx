import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, Pressable  } from 'react-native';
import Animated, { SlideInDown, FadeOutUp, FadeInDown } from 'react-native-reanimated';


type Props = {
    onStart: () => void;
};

export default function Home({ onStart }: Props) {
    const [showLogo, setShowLogo] = useState(true);

    const handlePress = () => {
        setShowLogo(false);

        // durée = celle de FadeOutUp
        setTimeout(() => {
            onStart();
        }, 500);
    };

    return (
        <View style={styles.container}>
            <Pressable  style={styles.btnContainer} onPress={handlePress}>

            <Image
                source={require("../../assets/img/stickers/top-stick.png")}
                style={styles.imageTop}
            />

            {showLogo && (
                <Animated.View
                    entering={FadeInDown.duration(500)}
                    exiting={FadeOutUp.duration(500)}
                    style={styles.logoWrapper}
                >
                    <Image
                    source={require("../../assets/icons/2100-logo.png")}
                    style={styles.image}
                    />
                </Animated.View>
            )}
        
            <Image
                source={require("../../assets/img/stickers/bottom-stick.png")}
                style={styles.imageBtm}
            />

            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        width: '100%',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#016df6',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    buttonText: {
        fontSize: 14,
        color: '#17161D',
        fontFamily: 'OpenRundeMedium',
        letterSpacing: -0.28,
    },
    logoWrapper: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },

    image: {
        width: 200,
        resizeMode: 'contain',
        transform: [{ rotate: '-5.58deg' }],
    },

    imageTop: {
        width: '140%',
        resizeMode: 'contain',
        position: 'absolute',
        top: -245,
    },
    imageBtm: {
        width: '125%',
        resizeMode: 'contain',
        position: 'absolute',
        bottom: -200,
        right: -60,
    },

});
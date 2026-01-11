
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const NUM_CARS = 15;

const CarAnimation = () => {
    const Car = () => {
        const anim = useRef(new Animated.Value(-100)).current;
        const yPos = Math.random() * height;
        const duration = 5000 + Math.random() * 5000;
        const delay = Math.random() * 2000;
        const size = Math.random() * 20 + 10;

        useEffect(() => {
            Animated.loop(
                Animated.timing(anim, {
                    toValue: width,
                    duration,
                    useNativeDriver: false,
                    delay,
                })
            ).start();
        }, [anim]);

        return (
            <Animated.View style={[styles.carContainer, { top: yPos, transform: [{ translateX: anim }] }]}>
                <MaterialCommunityIcons name="car" size={size} color="rgba(255, 0, 0, 0.4)" />
            </Animated.View>
        );
    };

    return (
        <View style={styles.container} pointerEvents="none">
            {Array.from({ length: NUM_CARS }).map((_, index) => (
                <Car key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    carContainer: {
        position: 'absolute',
    },
});

export default CarAnimation;

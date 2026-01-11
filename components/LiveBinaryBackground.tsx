
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');
const NUM_COLUMNS = Math.floor(width / 16);

const LiveBinaryBackground = () => {
    const BinaryColumn = () => {
        const anim = useRef(new Animated.Value(-height)).current;
        const binary = Array.from({ length: Math.floor(height / 16) }).map(() => Math.round(Math.random()));

        useEffect(() => {
            Animated.loop(
                Animated.timing(anim, {
                    toValue: height,
                    duration: 5000 + Math.random() * 5000,
                    useNativeDriver: false,
                    delay: Math.random() * 2000,
                })
            ).start();
        }, [anim]);

        return (
            <Animated.Text style={[styles.binaryColumn, { transform: [{ translateY: anim }] }]}>
                {binary.map((char, index) => (
                    <React.Fragment key={index}>{char}{'\n'}</React.Fragment>
                ))}
            </Animated.Text>
        );
    };

    return (
        <View style={styles.container} pointerEvents="none">
            {Array.from({ length: NUM_COLUMNS }).map((_, index) => (
                <BinaryColumn key={index} />
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
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    binaryColumn: {
        fontSize: 16,
        color: 'rgba(255, 0, 0, 0.4)',
    },
});

export default LiveBinaryBackground;

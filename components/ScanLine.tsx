// components/ScanLine.tsx
import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function ScanLine() {
  const scanLinePosition = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: 300,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLinePosition, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [scanLinePosition]);

  return (
    <Animated.View 
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: '#4CAF50',
          transform: [{ translateY: scanLinePosition }],
        }
      ]}
    />
  );
}
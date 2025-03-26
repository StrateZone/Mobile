import React, { useEffect, useRef } from "react";
import { View, Image, Animated, ActivityIndicator, Text } from "react-native";

import icon from "../assets/images/splash-icon.webp";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const textAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Hiệu ứng fade-in cho tiêu đề sau logo 500ms
    setTimeout(() => {
      Animated.timing(textAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 700);

    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Animated.View
        style={{ opacity: fadeAnimation }}
        className="rounded-lg overflow-hidden"
      >
        <Image
          source={icon}
          className="w-40"
          style={{ height: undefined, aspectRatio: 3 }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        style={{
          opacity: textAnimation,
        }}
        className="text-xl font-bold text-black"
      >
        StrateZone
      </Animated.Text>

      <ActivityIndicator size="large" color="black" className="mt-4" />
    </View>
  );
}

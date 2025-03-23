import React, { useEffect, useRef } from "react";
import { View, Image, Animated, ActivityIndicator } from "react-native";

import icon from "../assets/images/splash-icon.webp";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-[#ffffff]">
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

        <ActivityIndicator size="large" color="#000000" />
      </Animated.View>
    </View>
  );
}

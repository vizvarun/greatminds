import { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Welcome to Great Minds",
    description:
      "Connect with brilliant thinkers and innovators around the world.",
    image: require("@/assets/images/onboarding.png"),
  },
  {
    id: "2",
    title: "Learn & Grow",
    description: "Access resources and insights from industry experts.",
    image: require("@/assets/images/onboarding.png"),
  },
  {
    id: "3",
    title: "Join Our Community",
    description:
      "Be part of a global network of creative thinkers and problem solvers.",
    image: require("@/assets/images/onboarding.png"),
  },
];

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Complete onboarding and navigate to login
      completeOnboarding().then(() => router.replace("/(auth)/login"));
    }
  };

  const handleSkip = () => {
    completeOnboarding().then(() => router.replace("/(auth)/login"));
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const updateCurrentIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === "android" && styles.androidContainer,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentIndex}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

        {!isLastSlide && (
          <TouchableOpacity style={styles.skipContainer} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  androidContainer: {
    paddingTop: 30, // Add top padding for Android to account for status bar
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    width: width,
    height: height * 0.5, // Use 50% of screen height
    overflow: "hidden",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Will fill the container while maintaining aspect ratio
  },
  textContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 16,
    minWidth: 180,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: Typography.fontWeight.bold.primary,
  },
  skipContainer: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#888",
  },
});

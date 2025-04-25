import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import ChildAttendance from "@/components/parent/ChildAttendance";
import ChildDiary from "@/components/parent/ChildDiary";
import ChildTimetable from "@/components/parent/ChildTimetable";
import ChildFees from "@/components/parent/ChildFees";
import ChildSupport from "@/components/parent/ChildSupport";
import CustomAlert from "@/components/ui/CustomAlert";
import { StatusBar } from "expo-status-bar";

type TabType = "attendance" | "diary" | "timetable" | "fees" | "support";

type TabItem = {
  id: TabType;
  label: string;
  icon: string;
};

export default function ChildDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("attendance");
  const [childData, setChildData] = useState({
    name: "",
    enrollmentNumber: "",
    class: "",
    section: "",
  });
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });
  const [showRightIndicator, setShowRightIndicator] = useState(true);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Animated values for indicator animations
  const leftArrowAnim = useRef(new Animated.Value(0)).current;
  const rightArrowAnim = useRef(new Animated.Value(0)).current;

  // Tab configuration
  const tabs: TabItem[] = [
    { id: "attendance", label: "Attendance", icon: "calendar-check" },
    { id: "diary", label: "Diary", icon: "notebook" },
    { id: "timetable", label: "Timetable", icon: "timetable" },
    { id: "fees", label: "Fees", icon: "cash" },
    { id: "support", label: "Support", icon: "lifebuoy" },
  ];

  useEffect(() => {
    // Fetch child data - mock data for now
    if (id === "1") {
      setChildData({
        name: "Sarah Johnson",
        enrollmentNumber: "EN2023005",
        class: "5",
        section: "A",
      });
    } else if (id === "2") {
      setChildData({
        name: "Michael Johnson",
        enrollmentNumber: "EN2023006",
        class: "3",
        section: "B",
      });
    }
  }, [id]);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
  };

  // Completely rebuild components on tab change with improved styling for scroll and height issues
  const renderIsolatedTabContent = () => {
    switch (activeTab) {
      case "attendance":
        return (
          <View key={`attendance-static`} style={{ flex: 1, height: "100%" }}>
            <ChildAttendance childId={id} showAlert={showAlert} />
          </View>
        );
      case "diary":
        return (
          <View key={`diary-static`} style={{ flex: 1 }}>
            <ChildDiary childId={id} showAlert={showAlert} />
          </View>
        );
      case "timetable":
        return (
          <View key={`timetable-static`} style={styles.timetableContainer}>
            <ChildTimetable childId={id} />
          </View>
        );
      case "fees":
        return (
          <View key={`fees-static`} style={{ flex: 1 }}>
            <ChildFees childId={id} showAlert={showAlert} />
          </View>
        );
      case "support":
        return (
          <View key={`support-static`} style={{ flex: 1 }}>
            <ChildSupport childId={id} showAlert={showAlert} />
          </View>
        );
      default:
        return null;
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Setup arrow animations
  useEffect(() => {
    if (showLeftIndicator) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(leftArrowAnim, {
            toValue: -3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(leftArrowAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      leftArrowAnim.setValue(0);
    }

    if (showRightIndicator) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rightArrowAnim, {
            toValue: 3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(rightArrowAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      rightArrowAnim.setValue(0);
    }
  }, [showLeftIndicator, showRightIndicator]);

  const handleScroll = (event: any) => {
    const contentWidth = event.nativeEvent.contentSize.width;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;
    const xOffset = event.nativeEvent.contentOffset.x;

    setShowLeftIndicator(xOffset > 10);
    setShowRightIndicator(xOffset < contentWidth - layoutWidth - 10);
  };

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

    if (activeIndex > 1 && scrollViewRef.current) {
      const tabWidth = 120;
      const screenWidth = Dimensions.get("window").width;
      const scrollToX = Math.max(
        0,
        activeIndex * tabWidth - screenWidth / 2 + tabWidth / 2
      );

      scrollViewRef.current.scrollTo({ x: scrollToX, animated: true });
    }
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.childInfoContainer}>
          <Text style={styles.childName}>{childData.name}</Text>
          <Text style={styles.childDetails}>
            Enrollment: {childData.enrollmentNumber}
          </Text>
          <Text style={styles.childDetails}>
            Class: {childData.class} | Section: {childData.section}
          </Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {showLeftIndicator && (
          <Animated.View
            style={[
              styles.leftIndicator,
              { transform: [{ translateX: leftArrowAnim }] },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={20}
              color={primary}
            />
          </Animated.View>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollContainer}
          contentContainerStyle={styles.tabsContentContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: handleScroll,
            }
          )}
          scrollEventThrottle={16}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton,
              ]}
              onPress={() => handleTabChange(tab.id)}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? primary : "#666"}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.id && styles.activeTabButtonText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showRightIndicator && (
          <Animated.View
            style={[
              styles.rightIndicator,
              { transform: [{ translateX: rightArrowAnim }] },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={primary}
            />
          </Animated.View>
        )}
      </View>

      <View style={{ flex: 1 }}>{renderIsolatedTabContent()}</View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  childInfoContainer: {
    flex: 1,
  },
  childName: {
    fontSize: 22,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    marginBottom: 5,
  },
  childDetails: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 2,
  },
  tabsContainer: {
    position: "relative",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  tabsScrollContainer: {
    flex: 1,
    maxHeight: 50,
  },
  tabsContentContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  leftIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  rightIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 5,
    marginHorizontal: 4,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: primary,
  },
  tabButtonText: {
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
    color: "#666",
  },
  activeTabButtonText: {
    color: primary,
  },
  contentContainer: {
    flex: 1,
  },
  timetableContainer: {
    flex: 1,
    height: "100%",
    backgroundColor: "#f5f7fa",
    paddingTop: 0,
  },
});

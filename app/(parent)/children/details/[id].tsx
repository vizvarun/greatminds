import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChildDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Dummy child data
  const childData = {
    id: id as string,
    name: "Emily Johnson",
    enrollmentNumber: "EN2023056",
    class: "Grade 5",
    section: "Section B",
    image: null,
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    onConfirm = () => {},
    onCancel = () => {}
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      onCancel,
    });
  };

  const hideAlert = (confirmed: boolean = false) => {
    setAlert((prev) => {
      if (confirmed) {
        prev.onConfirm();
      } else {
        prev.onCancel();
      }
      return { ...prev, visible: false };
    });
  };

  const handleBack = () => {
    router.back();
  };

  // Card navigation handlers
  const navigateToAttendance = () => {
    router.push(`/(parent)/children/attendance/${id}`);
  };

  const navigateToDiary = () => {
    router.push(`/(parent)/children/diary/${id}`);
  };

  const navigateToTimetable = () => {
    router.push(`/(parent)/children/timetable/${id}`);
  };

  const navigateToFees = () => {
    router.push(`/(parent)/children/fees/${id}`);
  };

  const navigateToSupport = () => {
    router.push(`/(parent)/children/support/${id}`);
  };

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

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.actionCardsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToAttendance}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(76, 175, 80, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={24}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.actionTitle}>Attendance</Text>
            <Text style={styles.actionDescription}>
              View attendance history and reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={navigateToDiary}>
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(33, 150, 243, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="notebook-outline"
                size={24}
                color="#2196F3"
              />
            </View>
            <Text style={styles.actionTitle}>Class Diary</Text>
            <Text style={styles.actionDescription}>
              View homework and assignments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToTimetable}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(255, 152, 0, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#FF9800"
              />
            </View>
            <Text style={styles.actionTitle}>Timetable</Text>
            <Text style={styles.actionDescription}>
              View class schedule and subjects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={navigateToFees}>
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="currency-usd"
                size={24}
                color="#F44336"
              />
            </View>
            <Text style={styles.actionTitle}>Fees</Text>
            <Text style={styles.actionDescription}>
              View fee details and payment history
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToSupport}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(156, 39, 176, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color="#9C27B0"
              />
            </View>
            <Text style={styles.actionTitle}>Support</Text>
            <Text style={styles.actionDescription}>
              Contact teachers and submit inquiries
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => hideAlert(true)}
        onCancel={() => hideAlert(false)}
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
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "flex-start",
  },
  backButton: {
    marginRight: 15,
    marginTop: 5,
  },
  childInfoContainer: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  actionCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
});

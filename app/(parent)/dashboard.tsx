import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ParentDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, Parent!</Text>
          <Text style={styles.subtitle}>
            Keep track of your child's progress
          </Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pending Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>New Messages</Text>
            </View>
          </View>
        </View>

        <View style={styles.childrenSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            <TouchableOpacity onPress={() => router.push("/(parent)/children")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childrenList}
          >
            <TouchableOpacity
              style={styles.childCard}
              onPress={() => router.push("/(parent)/children/details/1")}
            >
              <Image
                source={require("@/assets/images/onboarding.png")}
                style={styles.childAvatar}
              />
              <Text style={styles.childName}>Sarah</Text>
              <Text style={styles.childGrade}>Grade 5</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: "75%" }]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.childCard}
              onPress={() => router.push("/(parent)/children/details/2")}
            >
              <Image
                source={require("@/assets/images/onboarding.png")}
                style={styles.childAvatar}
              />
              <Text style={styles.childName}>Michael</Text>
              <Text style={styles.childGrade}>Grade 3</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: "60%" }]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addChildCard}
              onPress={() => console.log("Add child")}
            >
              <View style={styles.addChildIcon}>
                <MaterialCommunityIcons name="plus" size={30} color={primary} />
              </View>
              <Text style={styles.addChildText}>Add Child</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventDateBadge}>
              <Text style={styles.eventDateDay}>15</Text>
              <Text style={styles.eventDateMonth}>May</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Parent-Teacher Meeting</Text>
              <Text style={styles.eventTime}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="#666"
                />{" "}
                2:00 PM - 3:00 PM
              </Text>
              <Text style={styles.eventLocation}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color="#666"
                />{" "}
                Main Building, Room 105
              </Text>
            </View>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventDateBadge}>
              <Text style={styles.eventDateDay}>22</Text>
              <Text style={styles.eventDateMonth}>May</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Annual Sports Day</Text>
              <Text style={styles.eventTime}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="#666"
                />{" "}
                9:00 AM - 4:00 PM
              </Text>
              <Text style={styles.eventLocation}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color="#666"
                />{" "}
                School Grounds
              </Text>
            </View>
          </View>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={hideAlert}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 4,
  },
  statsSection: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  progressTitle: {
    marginBottom: 15,
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: Typography.fontWeight.bold.primary,
    color: primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
  },
  childrenSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  childrenList: {
    marginBottom: 15,
  },
  childCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 120,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  childName: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  childGrade: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    width: "100%",
  },
  progress: {
    height: "100%",
    backgroundColor: primary,
    borderRadius: 3,
  },
  addChildCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  addChildIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addChildText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  upcomingSection: {
    marginTop: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventDateBadge: {
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    width: 50,
  },
  eventDateDay: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: primary,
  },
  eventDateMonth: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 3,
  },
  eventLocation: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
});

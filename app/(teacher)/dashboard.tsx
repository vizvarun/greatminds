import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherDashboard() {
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

  const branches = [
    {
      id: "1",
      name: "Main Campus",
      address: "123 Education St, New York",
      classes: 12,
    },
    {
      id: "2",
      name: "East Wing",
      address: "456 Learning Ave, New York",
      classes: 8,
    },
    {
      id: "3",
      name: "West Campus",
      address: "789 School Road, New York",
      classes: 10,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, Teacher!</Text>
        <Text style={styles.subtitle}>Manage your classes and students</Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionSubTitle}>Today's Summary</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Classes Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>78</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </View>
        </View>
      </View>

      <View style={styles.branchesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your School Branches</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {branches.map((branch) => (
          <TouchableOpacity
            key={branch.id}
            style={styles.branchCard}
            onPress={() =>
              router.push(`/(teacher)/branches/${branch.id}/grades`)
            }
          >
            <View style={styles.branchIconContainer}>
              <MaterialCommunityIcons
                name="school-outline"
                size={24}
                color={primary}
              />
            </View>
            <View style={styles.branchDetails}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.branchAddress}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color="#666"
                />{" "}
                {branch.address}
              </Text>
              <View style={styles.branchStatsContainer}>
                <Text style={styles.branchStats}>
                  <MaterialCommunityIcons
                    name="google-classroom"
                    size={14}
                    color="#666"
                  />{" "}
                  {branch.classes} Classes
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={primary}
            />
          </TouchableOpacity>
        ))}
      </View>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={hideAlert}
      />
    </ScrollView>
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
  sectionSubTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 15,
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
  branchesSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  branchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  branchIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  branchDetails: {
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  branchAddress: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 6,
  },
  branchStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  branchStats: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  actionsSection: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: primary,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
});

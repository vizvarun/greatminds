import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      color: "#4CAF50",
      icon: "school-outline",
    },
    {
      id: "2",
      name: "East Wing",
      address: "456 Learning Ave, New York",
      classes: 8,
      color: "#2196F3",
      icon: "domain",
    },
    {
      id: "3",
      name: "West Campus",
      address: "789 School Road, New York",
      classes: 10,
      color: "#FF9800",
      icon: "office-building",
    },
  ];

  const stats = [
    {
      id: "classes",
      label: "Classes Today",
      value: 3,
      icon: "google-classroom",
      color: "#4CAF50",
    },
    {
      id: "students",
      label: "Students",
      value: 78,
      icon: "account-group",
      color: "#2196F3",
    },
    {
      id: "tasks",
      label: "Pending Tasks",
      value: 5,
      icon: "clipboard-list",
      color: "#FF9800",
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
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCardWrapper}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: `${stat.color}10` },
                ]}
              >
                <Text style={[styles.statNumber, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.branchesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your School Branches</Text>
        </View>

        {branches.map((branch) => (
          <TouchableOpacity
            key={branch.id}
            style={styles.branchCard}
            onPress={() =>
              router.push(`/(teacher)/branches/${branch.id}/grades`)
            }
          >
            <View
              style={[
                styles.branchIconContainer,
                { backgroundColor: `${branch.color}20` },
              ]}
            >
              <MaterialCommunityIcons
                name={branch.icon}
                size={24}
                color={branch.color}
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
                <View style={styles.classBadge}>
                  <MaterialCommunityIcons
                    name="google-classroom"
                    size={14}
                    color={branch.color}
                  />
                  <Text style={[styles.branchStats, { color: branch.color }]}>
                    {" "}
                    {branch.classes} Classes
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.chevronContainer,
                { backgroundColor: `${branch.color}10` },
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={branch.color}
              />
            </View>
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
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCardWrapper: {
    width: "31%",
  },
  statCard: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: Typography.fontWeight.bold.primary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    textAlign: "center",
  },
  branchesSection: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    justifyContent: "flex-start",
  },
  classBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  branchStats: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#2196F3",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

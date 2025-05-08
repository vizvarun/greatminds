import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";

export default function TeacherDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });
  const { userProfile, isLoading, authError, refreshUserProfile } = useAuth();

  console.log("userProfile", userProfile);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshUserProfile().finally(() => {
      setRefreshing(false);
    });
  }, [refreshUserProfile]);

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

  useEffect(() => {
    if (authError) {
      showAlert("Error", authError, "error");
    }
  }, [authError]);

  // Function to get school icon based on school name
  const getSchoolIcon = (schoolName: string) => {
    const lowercaseName = schoolName.toLowerCase();
    if (
      lowercaseName.includes("kinderland") ||
      lowercaseName.includes("kindergarten")
    ) {
      return "school-outline";
    } else if (lowercaseName.includes("academy")) {
      return "domain";
    } else {
      return "office-building";
    }
  };

  // Function to get color based on school index
  const getSchoolColor = (index: number) => {
    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"];
    return colors[index % colors.length];
  };

  // Get the list of schools from profile data
  const schools = React.useMemo(() => {
    if (!userProfile || !userProfile.school_ids) {
      return [];
    }

    return userProfile.school_ids.map((schoolData, index) => {
      const schoolDetails = schoolData[0];
      const classesData = schoolData[1]?.classes_list || [];

      // Count total sections across all classes
      const totalSections = classesData.reduce((total, classItem) => {
        const sections = classItem[1]?.sections || [];
        return total + sections.length;
      }, 0);

      return {
        id: schoolDetails.schoolId.toString(),
        name: schoolDetails.schoolName,
        address: `${schoolDetails.schoolAddress}, ${schoolDetails.city}, ${schoolDetails.state}, ${schoolDetails.pincode}`,
        classes: classesData.length,
        color: getSchoolColor(index),
        icon: getSchoolIcon(schoolDetails.schoolName),
      };
    });
  }, [userProfile]);

  // Get total stats across all schools
  const totalClasses = React.useMemo(() => {
    return schools.reduce((total, school) => total + school.classes, 0);
  }, [schools]);

  const totalSections = React.useMemo(() => {
    return schools.reduce((total, school) => total + (school.sections || 0), 0);
  }, [schools]);

  // Calculate approximate student count (using average of 25 students per section)
  const approximateStudentCount = totalSections * 25;

  const stats = [
    {
      id: "classes",
      label: "Classes",
      value: totalClasses || 0,
      icon: "google-classroom",
      color: "#4CAF50",
    },
    {
      id: "sections",
      label: "Sections",
      value: totalSections || 0,
      icon: "account-group",
      color: "#2196F3",
    },
    {
      id: "students",
      label: "~Students",
      value: approximateStudentCount || 0,
      icon: "account-multiple",
      color: "#FF9800",
    },
  ];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.loadingText}>Loading teacher dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {userProfile?.user?.firstName || "Teacher"}!
        </Text>
        <Text style={styles.subtitle}>Manage your classes and students</Text>
      </View>

      {/* <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
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
      </View> */}

      <View style={styles.branchesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your School</Text>
        </View>

        {schools.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="school-outline"
              size={48}
              color="#ccc"
            />
            <Text style={styles.emptyStateText}>No schools assigned yet</Text>
          </View>
        ) : (
          schools.map((school) => (
            <TouchableOpacity
              key={school.id}
              style={styles.branchCard}
              onPress={() =>
                router.push(`/(teacher)/branches/${school.id}/grades`)
              }
            >
              <View
                style={[
                  styles.branchIconContainer,
                  { backgroundColor: `${school.color}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={school.icon}
                  size={24}
                  color={school.color}
                />
              </View>
              <View style={styles.branchDetails}>
                <Text style={styles.branchName}>{school.name}</Text>
                <Text style={styles.branchAddress}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={14}
                    color="#666"
                  />{" "}
                  {school.address}
                </Text>
                <View style={styles.branchStatsContainer}>
                  <View style={styles.classBadge}>
                    <MaterialCommunityIcons
                      name="google-classroom"
                      size={14}
                      color={school.color}
                    />
                    <Text style={[styles.branchStats, { color: school.color }]}>
                      {" "}
                      {school.classes} Classes
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.chevronContainer,
                  { backgroundColor: `${school.color}10` },
                ]}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={school.color}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
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
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    marginTop: 4,
  },
  branchesSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  branchCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  branchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  emptyState: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
});

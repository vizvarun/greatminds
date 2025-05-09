import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import InitialsAvatar from "@/components/ui/InitialsAvatar";
import CustomAlert from "@/components/ui/CustomAlert";

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { studentProfiles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (studentProfiles && studentProfiles.length > 0) {
      const foundStudent = studentProfiles.find((s) => s.id.toString() === id);
      setStudent(foundStudent);
    }
    setLoading(false);
  }, [id, studentProfiles]);

  const formatFullName = (studentData: any) => {
    if (!studentData?.student) return "";
    const { firstname, middlename, lastname } = studentData.student;
    return [firstname, middlename, lastname].filter(Boolean).join(" ");
  };

  const getSchoolClassInfo = (studentData: any) => {
    if (
      !studentData?.section_details ||
      studentData.section_details.length === 0
    ) {
      return {
        school: "Not available",
        class: "Not available",
        section: "Not available",
      };
    }

    const sectionDetails = studentData.section_details[0];
    return {
      school: sectionDetails.schoolname || "Not available",
      class: sectionDetails.classname || "Not available",
      section: sectionDetails.section || "Not available",
    };
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.loadingText}>Loading student profile...</Text>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="account-alert"
          size={48}
          color="#F44336"
        />
        <Text style={styles.errorText}>Student not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const fullName = formatFullName(student);
  const { school, class: className, section } = getSchoolClassInfo(student);
  const enrollmentNumber =
    student.student?.enrollment_number ||
    student.student?.enrollmentno ||
    "Not available";
  const dateOfBirth = student.student?.dob
    ? new Date(student.student.dob).toLocaleDateString()
    : "Not available";
  const fatherName = student.parents[1]?.firstname || "Not available";
  const motherName = student.parents[0]?.firstname || "Not available";
  const attendancePercentage = student?.attendance?.percentage || "N/A";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profile</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <InitialsAvatar
              name={fullName}
              size={80}
              imageUri={student.student?.profilePicUrl}
              style={styles.avatar}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.studentName}>{fullName}</Text>
              {/* <View style={styles.infoTag}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={14}
                  color={attendancePercentage >= 90 ? "#4CAF50" : "#FF9800"}
                />
                <Text style={styles.infoTagText}>
                  {attendancePercentage}% Attendance
                </Text>
              </View> */}
            </View>
          </View>

          {/* School Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>School Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>School</Text>
                <Text style={styles.infoValue}>{school}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Class</Text>
                <Text style={styles.infoValue}>{className}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Section</Text>
                <Text style={styles.infoValue}>{section}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Enrollment No</Text>
                <Text style={styles.infoValue}>{enrollmentNumber}</Text>
              </View>
            </View>
          </View>

          {/* Personal Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{dateOfBirth}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Father's Name</Text>
                <Text style={styles.infoValue}>{fatherName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mother's Name</Text>
                <Text style={styles.infoValue}>{motherName}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(parent)/children/attendance/${id}`)}
            >
              <MaterialCommunityIcons
                name="clipboard-check"
                size={22}
                color="#4CAF50"
              />
              <Text style={styles.actionText}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(parent)/children/fees/${id}`)}
            >
              <MaterialCommunityIcons name="cash" size={22} color="#FF9800" />
              <Text style={styles.actionText}>Fee Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(parent)/children/support/${id}`)}
            >
              <MaterialCommunityIcons
                name="help-circle"
                size={22}
                color="#607D8B"
              />
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backIcon: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  scrollContainer: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    marginBottom: 32,
  },
  profileHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    borderWidth: 3,
    borderColor: "#f0f0f0",
  },
  nameContainer: {
    marginLeft: 16,
    justifyContent: "center",
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    marginBottom: 8,
  },
  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  infoTagText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    marginLeft: 6,
    color: "#555",
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#555",
    marginBottom: 8,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  addressText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    lineHeight: 20,
  },
  quickActions: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: "center",
    padding: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
  },
});

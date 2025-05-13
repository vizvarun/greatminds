import CustomAlert from "@/components/ui/CustomAlert";
import InitialsAvatar from "@/components/ui/InitialsAvatar";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSectionId } from "@/utils/sectionUtils";

export default function ParentDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const { studentProfiles, refreshUserProfile, isLoading } = useAuth();

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

  const navigateToAttendance = useCallback(
    (studentId: string, sectionId: string) => {
      router.push(
        `/(parent)/children/attendance/${studentId}?sectionId=${sectionId}`
      );
    },
    []
  );

  const navigateToDiary = useCallback(
    (studentId: string, sectionId: string) => {
      router.push(
        `/(parent)/children/diary/${studentId}?sectionId=${sectionId}`
      );
    },
    []
  );

  const navigateToTimetable = useCallback(
    (studentId: string, sectionId: string) => {
      router.push(
        `/(parent)/children/timetable/${studentId}?sectionId=${sectionId}`
      );
    },
    []
  );

  const navigateToProfile = useCallback(
    (studentId: string, sectionId: string) => {
      router.push(
        `/(parent)/children/details/${studentId}?sectionId=${sectionId}`
      );
    },
    []
  );

  const getAttendanceStatus = (student: any) => {
    return {
      isPresent: true,
      percentage: student?.attendance?.percentage || 95,
    };
  };

  const formatFullName = (student: any) => {
    const { firstname, middlename, lastname } = student.student;
    return [firstname, middlename, lastname].filter(Boolean).join(" ");
  };

  const getSectionSchoolInfo = (studentWithSection: any) => {
    if (!studentWithSection.currentSectionDetail) {
      return "No section information available";
    }

    const sectionDetails = studentWithSection.currentSectionDetail;
    return `Grade ${sectionDetails.classname}-${sectionDetails.section} • ${sectionDetails.schoolname}`;
  };

  const studentProfilesWithSections = React.useMemo(() => {
    if (!studentProfiles || studentProfiles.length === 0) {
      return [];
    }

    return studentProfiles.flatMap((student) => {
      if (!student.section_details || student.section_details.length === 0) {
        return [
          {
            ...student,
            currentSectionDetail: null,
            uniqueId: `${student.id}-null`,
          },
        ];
      }

      return student.section_details.map((sectionDetail) => ({
        ...student,
        currentSectionDetail: sectionDetail,
        uniqueId: `${student.id}-${
          sectionDetail.id || sectionDetail.section_id
        }`,
      }));
    });
  }, [studentProfiles]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Your Children</Text>
        <Text style={styles.subtitle}>
          View and manage your children's profiles
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={styles.loadingText}>Loading student profiles...</Text>
          </View>
        ) : studentProfilesWithSections &&
          studentProfilesWithSections.length > 0 ? (
          <View style={styles.cardsContainer}>
            {studentProfilesWithSections.map((studentWithSection, index) => {
              console.log("Student Section Data: ", studentWithSection);
              const fullName = formatFullName(studentWithSection);
              const schoolInfo = getSectionSchoolInfo(studentWithSection);
              const { isPresent, percentage } =
                getAttendanceStatus(studentWithSection);

              const attendanceColor =
                percentage >= 90
                  ? "#4CAF50"
                  : percentage >= 80
                  ? "#FF9800"
                  : "#F44336";

              return (
                <View
                  key={getSectionId(studentWithSection.currentSectionDetail)}
                  style={styles.studentCard}
                >
                  <View style={styles.cardHeader}>
                    <InitialsAvatar
                      name={fullName}
                      size={60}
                      imageUri={studentWithSection.student.profilePicUrl}
                      style={styles.avatar}
                    />

                    <View style={styles.headerInfo}>
                      <Text style={styles.studentName}>{fullName}</Text>
                      <Text style={styles.schoolInfo} numberOfLines={2}>
                        {schoolInfo}
                      </Text>
                    </View>
                  </View>

                  {/* <View style={styles.infoRow}>
                    <View
                      style={[
                        styles.infoTag,
                        { backgroundColor: attendanceColor + "15" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={16}
                        color={attendanceColor}
                      />
                      <Text
                        style={[styles.infoTagText, { color: attendanceColor }]}
                      >
                        {percentage}% Attendance
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.infoTag,
                        {
                          backgroundColor: isPresent
                            ? "#4CAF5015"
                            : "#F4433615",
                          marginLeft: 8,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={isPresent ? "account-check" : "account-cancel"}
                        size={16}
                        color={isPresent ? "#4CAF50" : "#F44336"}
                      />
                      <Text
                        style={[
                          styles.infoTagText,
                          { color: isPresent ? "#4CAF50" : "#F44336" },
                        ]}
                      >
                        {isPresent ? "Present today" : "Absent today"}
                      </Text>
                    </View>
                  </View> */}

                  <View style={styles.actionGrid}>
                    <TouchableOpacity
                      style={styles.actionTile}
                      onPress={() =>
                        navigateToProfile(
                          studentWithSection.id.toString(),
                          getSectionId(studentWithSection.currentSectionDetail)
                        )
                      }
                    >
                      <View
                        style={[
                          styles.actionIconBg,
                          { backgroundColor: "#795548" + "20" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="account-details"
                          size={24}
                          color="#795548"
                        />
                      </View>
                      <Text style={styles.actionText}>Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionTile}
                      onPress={() =>
                        navigateToAttendance(
                          studentWithSection.id.toString(),
                          getSectionId(studentWithSection.currentSectionDetail)
                        )
                      }
                    >
                      <View
                        style={[
                          styles.actionIconBg,
                          { backgroundColor: "#4CAF50" + "20" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="clipboard-check"
                          size={24}
                          color="#4CAF50"
                        />
                      </View>
                      <Text style={styles.actionText}>Attendance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionTile}
                      onPress={() =>
                        navigateToDiary(
                          studentWithSection.id.toString(),
                          getSectionId(studentWithSection.currentSectionDetail)
                        )
                      }
                    >
                      <View
                        style={[
                          styles.actionIconBg,
                          { backgroundColor: "#2196F3" + "20" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="notebook"
                          size={24}
                          color="#2196F3"
                        />
                      </View>
                      <Text style={styles.actionText}>Diary</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionTile}
                      onPress={() =>
                        navigateToTimetable(
                          studentWithSection.id.toString(),
                          getSectionId(studentWithSection.currentSectionDetail)
                        )
                      }
                    >
                      <View
                        style={[
                          styles.actionIconBg,
                          { backgroundColor: "#9C27B0" + "20" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="timetable"
                          size={24}
                          color="#9C27B0"
                        />
                      </View>
                      <Text style={styles.actionText}>Timetable</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionTile}
                      onPress={() =>
                        router.push(
                          `/(parent)/children/fees/${
                            studentWithSection.id
                          }?sectionId=${getSectionId(
                            studentWithSection.currentSectionDetail
                          )}`
                        )
                      }
                    >
                      <View
                        style={[
                          styles.actionIconBg,
                          { backgroundColor: "#FF9800" + "20" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="cash"
                          size={24}
                          color="#FF9800"
                        />
                      </View>
                      <Text style={styles.actionText}>Fees</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionTile}
                      onPress={() =>
                        router.push(
                          `/(parent)/children/support/${
                            studentWithSection.id
                          }?sectionId=${getSectionId(
                            studentWithSection.currentSectionDetail
                          )}`
                        )
                      }
                    >
                      <View
                        style={[
                          styles.actionIconBg,
                          { backgroundColor: "#607D8B" + "20" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="help-circle"
                          size={24}
                          color="#607D8B"
                        />
                      </View>
                      <Text style={styles.actionText}>Support</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-child"
              size={48}
              color="#ccc"
            />
            <Text style={styles.emptyStateText}>No children found</Text>
            <Text style={styles.emptyStateSubtext}>
              Please contact your school administrator if this is incorrect
            </Text>
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyState: {
    padding: 40,
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  emptyStateSubtext: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
    textAlign: "center",
  },
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
  cardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  studentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  headerInfo: {
    marginLeft: 14,
    justifyContent: "center",
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  schoolInfo: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  infoTagText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    marginLeft: 6,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  actionTile: {
    width: "33.33%",
    alignItems: "center",
    padding: 8,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    textAlign: "center",
  },
});

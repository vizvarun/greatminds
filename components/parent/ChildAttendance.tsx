import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";

type Props = {
  childId: string;
  showAlert: (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
};

type AttendanceData = {
  [date: string]: {
    status: "present" | "absent" | "late" | "leave" | "holiday";
    marked: boolean;
  };
};

export default function ChildAttendance({ childId, showAlert }: Props) {
  const [activeView, setActiveView] = useState<"calendar" | "trends">(
    "calendar"
  );
  const params = useLocalSearchParams();

  // Define color constants to ensure consistency
  const statusColors = {
    present: "#4CAF50", // Green
    absent: "#F44336", // Red
    late: "#FF9800", // Orange
    leave: "#9C27B0", // Purple
    holiday: "#2196F3", // Blue
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    // May 2023 - Comprehensive dummy data
    "2023-05-01": { status: "present", marked: true },
    "2023-05-02": { status: "present", marked: true },
    "2023-05-03": { status: "present", marked: true },
    "2023-05-04": { status: "absent", marked: true },
    "2023-05-05": { status: "present", marked: true },
    "2023-05-08": { status: "late", marked: true },
    "2023-05-09": { status: "present", marked: true },
    "2023-05-10": { status: "present", marked: true },
    "2023-05-11": { status: "leave", marked: true },
    "2023-05-12": { status: "leave", marked: true },
    "2023-05-15": { status: "present", marked: true },
    "2023-05-16": { status: "present", marked: true },
    "2023-05-17": { status: "present", marked: true },
    "2023-05-18": { status: "present", marked: true },
    "2023-05-19": { status: "absent", marked: true },
    "2023-05-22": { status: "holiday", marked: true },
    "2023-05-23": { status: "present", marked: true },
    "2023-05-24": { status: "present", marked: true },
    "2023-05-25": { status: "late", marked: true },
    "2023-05-26": { status: "present", marked: true },
    "2023-05-29": { status: "holiday", marked: true },
    "2023-05-30": { status: "present", marked: true },
    "2023-05-31": { status: "present", marked: true },
  });

  // Generate marked dates in the format required by the calendar
  const getMarkedDates = useCallback(() => {
    const markedDates: any = {};

    Object.entries(attendanceData).forEach(([date, data]) => {
      let dotColor = statusColors[data.status];

      markedDates[date] = {
        marked: true,
        dotColor,
      };
    });

    return markedDates;
  }, [attendanceData]);

  // Check for leave application success message from the apply leave screen
  useEffect(() => {
    if (params.leaveApplied === "true" && params.selectedDates) {
      showAlert(
        "Leave Applied",
        "Your leave application has been submitted successfully",
        "success"
      );

      // Clear the parameters after showing the alert
      router.setParams({
        leaveApplied: undefined,
        selectedDates: undefined,
      });
    }
  }, [params, showAlert]);

  // Navigate to leave application screen
  const handleApplyLeavePress = () => {
    router.push(`/children/leave/apply?childId=${childId}`);
  };

  const getStatsCounts = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      total: 0,
    };

    Object.values(attendanceData).forEach((data) => {
      if (data.status !== "holiday") {
        counts.total++;
        counts[data.status]++;
      }
    });

    return counts;
  };

  const stats = getStatsCounts();
  const attendancePercentage = stats.total
    ? Math.round(((stats.present + stats.late) / stats.total) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <TouchableOpacity
          style={styles.applyLeaveButton}
          onPress={handleApplyLeavePress}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.applyLeaveButtonText}>Apply Leave</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabButtons}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeView === "calendar" && styles.activeTabButton,
          ]}
          onPress={() => setActiveView("calendar")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeView === "calendar" && styles.activeTabButtonText,
            ]}
          >
            Detailed Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeView === "trends" && styles.activeTabButton,
          ]}
          onPress={() => setActiveView("trends")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeView === "trends" && styles.activeTabButtonText,
            ]}
          >
            Trends
          </Text>
        </TouchableOpacity>
      </View>

      {activeView === "calendar" ? (
        <ScrollView>
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={getMarkedDates()}
              theme={{
                selectedDayBackgroundColor: primary,
                todayTextColor: primary,
                dotStyle: { marginBottom: 3 },
              }}
            />

            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Legend:</Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: statusColors.present },
                    ]}
                  />
                  <Text style={styles.legendText}>Present</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: statusColors.absent },
                    ]}
                  />
                  <Text style={styles.legendText}>Absent</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: statusColors.late },
                    ]}
                  />
                  <Text style={styles.legendText}>Late</Text>
                </View>
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: statusColors.leave },
                    ]}
                  />
                  <Text style={styles.legendText}>Leave</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: statusColors.holiday },
                    ]}
                  />
                  <Text style={styles.legendText}>Holiday</Text>
                </View>
                <View style={styles.legendItem} />
              </View>
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Monthly Summary:</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{attendancePercentage}%</Text>
                  <Text style={styles.statLabel}>Attendance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.present}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.absent}</Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.leave}</Text>
                  <Text style={styles.statLabel}>Leave</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          <View style={styles.trendsContainer}>
            <View style={styles.trendCard}>
              <Text style={styles.trendTitle}>Previous Month</Text>
              <View style={styles.trendRow}>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>92%</Text>
                  <Text style={styles.trendLabel}>Attendance</Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>18</Text>
                  <Text style={styles.trendLabel}>Present</Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>1</Text>
                  <Text style={styles.trendLabel}>Absent</Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>1</Text>
                  <Text style={styles.trendLabel}>Leave</Text>
                </View>
              </View>
            </View>

            <View style={styles.trendCard}>
              <Text style={styles.trendTitle}>Year to Date</Text>
              <View style={styles.trendRow}>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>95%</Text>
                  <Text style={styles.trendLabel}>Attendance</Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>85</Text>
                  <Text style={styles.trendLabel}>Present</Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>3</Text>
                  <Text style={styles.trendLabel}>Absent</Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendValue}>4</Text>
                  <Text style={styles.trendLabel}>Leave</Text>
                </View>
              </View>
            </View>

            <View style={styles.trendInsight}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={primary}
              />
              <Text style={styles.insightText}>
                Sarah's attendance is better than 85% of students in her class.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  applyLeaveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  applyLeaveButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
  tabButtons: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
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
  calendarContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  summaryContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 4,
  },
  trendsContainer: {
    padding: 16,
  },
  trendCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trendItem: {
    alignItems: "center",
  },
  trendValue: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: primary,
  },
  trendLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 4,
  },
  trendInsight: {
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  insightText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
  },
});

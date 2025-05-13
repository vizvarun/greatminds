import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { fetchStudentAttendance } from "@/services/attendanceApi";
import { useAuth } from "@/context/AuthContext";

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
    status: "present" | "absent" | "leave" | "holiday";
    marked: boolean;
    remarks?: string;
  };
};

export default function ChildAttendance({ childId, showAlert }: Props) {
  const [activeView, setActiveView] = useState<"calendar" | "trends">(
    "calendar"
  );
  const params = useLocalSearchParams();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define brighter color constants that are more visible while still somewhat subtle
  const statusColors = {
    present: "#4CAF50", // Brighter Green
    absent: "#FF5252", // Brighter Red
    leave: "#9C27B0", // Purple
    holiday: "#2196F3", // Blue
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  // Helper function to normalize date to YYYY-MM-DD format
  function normalizeDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceForCurrentMonth = async () => {
      if (!childId) return;

      setIsLoading(true);
      setError(null);

      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const year = currentDate.getFullYear();

        // Get section ID from student profile (or use params if available)
        const sectionId = params.sectionId || "4"; // Default or get from context

        // Get user ID from user profile or context
        const userId = userProfile?.user?.id || "10"; // Default or get from context

        const response = await fetchStudentAttendance(
          userId,
          childId,
          sectionId,
          month,
          year
        );

        // Transform API response to the format needed by the calendar
        const transformedData: AttendanceData = {};

        response.attendance.forEach((record) => {
          // Map API status codes to our UI status types
          let status: "present" | "absent" | "leave" | "holiday";

          switch (record.attendance) {
            case "PR":
              status = "present";
              break;
            case "AB":
              status = "absent";
              break;
            case "LE":
              status = "leave";
              break;
            default:
              status = "present"; // Default fallback
          }

          transformedData[record.date] = {
            status,
            marked: true,
            remarks: record.remarks,
          };
        });

        setAttendanceData(transformedData);
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError("Failed to load attendance data. Please try again.");
        showAlert("Error", "Failed to load attendance data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceForCurrentMonth();
  }, [childId, params.sectionId, userProfile]);

  // Enhanced rendering for calendar days with brighter colors
  const renderDay = (day: any, item: any) => {
    if (!day) return null;
    const dateString = day.dateString;
    const data = attendanceData[dateString];
    const isToday = dateString === normalizeDate(new Date());

    return (
      <View style={[styles.dayContainer, isToday && styles.todayContainer]}>
        <Text style={[styles.dayText, isToday && styles.todayText]}>
          {day.day}
        </Text>
        {data && (
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: statusColors[data.status],
                width: 12, // Increase size for better visibility
                height: 12,
                borderRadius: 6,
              },
            ]}
          />
        )}
      </View>
    );
  };

  // Modify getMarkedDates to apply styling for all statuses
  const getMarkedDates = useCallback(() => {
    const markedDates: any = {};

    Object.entries(attendanceData).forEach(([date, data]) => {
      const color = statusColors[data.status];

      markedDates[date] = {
        customStyles: {
          container: {
            borderRadius: 8,
            backgroundColor: `${color}20`, // Adding a light background for all statuses
          },
          text: {
            color: "#333",
          },
          dotView: {
            position: "absolute",
            top: 3,
            right: 3,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: color,
          },
        },
      };
    });

    return markedDates;
  }, [attendanceData, statusColors]);

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
    ? Math.round((stats.present / stats.total) * 100)
    : 0;

  // Render loading state
  if (isLoading && Object.keys(attendanceData).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Attendance</Text>
        </View>
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
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={50}
                color="#F44336"
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchAttendanceForCurrentMonth()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.calendarContainer}>
              <Calendar
                markingType="custom"
                markedDates={getMarkedDates()}
                hideExtraDays={true}
                enableSwipeMonths={true}
                renderDay={renderDay}
                theme={{
                  calendarBackground: "#fff",
                  todayTextColor: primary,
                  arrowColor: primary,
                  monthTextColor: "#333",
                  textDayFontFamily: Typography.fontFamily.primary,
                  textMonthFontFamily: Typography.fontWeight.semiBold.primary,
                  textDayHeaderFontFamily: Typography.fontWeight.medium.primary,
                  "stylesheet.day.basic": {
                    base: {
                      width: 40,
                      height: 40,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  },
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
                    <Text style={styles.statValue}>
                      {attendancePercentage}%
                    </Text>
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
          )}
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

const additionalStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#F44336",
    fontFamily: Typography.fontWeight.medium.primary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});

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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
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
    justifyContent: "flex-start", // Changed from space-between to flex-start
    marginVertical: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24, // Added margin between items
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
  dayContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  todayText: {
    fontWeight: "bold",
    color: primary,
  },
  statusIndicator: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ...additionalStyles,
});

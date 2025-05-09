import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import {
  fetchSectionTimetable,
  TimetableEntry,
  deleteTimetableEntry,
} from "@/services/timetableApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type DaySchedule = {
  day: Day;
  periods: TimetableEntry[];
};

export default function SectionTimetableScreen() {
  const { branchId, gradeId, sectionId } = useLocalSearchParams();

  // Get today's day name (Monday, Tuesday, etc.)
  const getTodayDayName = (): Day => {
    const days: Day[] = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay();
    // Convert from JS day (0=Sunday) to our app's days (0=Monday), handle Sunday by defaulting to Monday
    const dayIndex = today === 0 ? 0 : today - 1;
    // If today is Sunday or the index is somehow invalid, default to Monday
    return dayIndex >= 0 && dayIndex < days.length ? days[dayIndex] : "Monday";
  };

  const [selectedDay, setSelectedDay] = useState<Day>(getTodayDayName());
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timetableData, setTimetableData] = useState<DaySchedule[]>([
    { day: "Monday", periods: [] },
    { day: "Tuesday", periods: [] },
    { day: "Wednesday", periods: [] },
    { day: "Thursday", periods: [] },
    { day: "Friday", periods: [] },
    { day: "Saturday", periods: [] },
  ]);

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const daysScrollViewRef = useRef<ScrollView>(null);

  // Fetch timetable data when day changes
  const fetchTimetable = useCallback(async () => {
    if (!sectionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSectionTimetable(
        sectionId as string,
        selectedDay
      );

      console.log("Timetable data received:", data, "length:", data.length);

      if (!data || data.length === 0) {
        console.log("No timetable entries found for this day");
      }

      // Update the timetable data state for the selected day
      setTimetableData((prev) =>
        prev.map((dayData) => {
          if (dayData.day === selectedDay) {
            return { ...dayData, periods: data };
          }
          return dayData;
        })
      );
    } catch (err) {
      console.error("Failed to fetch timetable data:", err);
      setError("Failed to load timetable. Please try again.");
      showAlert("Error", "Failed to load timetable data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, selectedDay]);

  // Fetch data when component mounts or day changes
  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // Fix the auto-scroll to selected day
  useEffect(() => {
    // Find the index of today's day in the timetable data
    const todayIndex = timetableData.findIndex(
      (day) => day.day === selectedDay
    );

    // Calculate approximate scroll position (each button is about 100-120px wide)
    if (todayIndex >= 0 && daysScrollViewRef.current) {
      // Increase timeout to ensure the ScrollView is fully rendered
      setTimeout(() => {
        daysScrollViewRef.current?.scrollTo({
          x: todayIndex * 80, // Adjusted width for more accurate positioning
          animated: true, // Set to false initially to avoid animation conflicts
        });
      }, 100); // Increased timeout for better reliability
    }
  }, [timetableData, selectedDay]); // Add dependencies to ensure effect runs at appropriate times

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

  const togglePeriodExpansion = (periodId: string) => {
    setExpandedPeriods((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(periodId)) {
        newSet.delete(periodId);
      } else {
        newSet.add(periodId);
      }
      return newSet;
    });
  };

  const handleAddPeriod = () => {
    router.push(
      `/(teacher)/timetable/add?branchId=${branchId}&gradeId=${gradeId}&sectionId=${sectionId}&day=${selectedDay}`
    );
  };

  const handleEditPeriod = (period: TimetableEntry) => {
    router.push(
      `/(teacher)/timetable/add?branchId=${branchId}&gradeId=${gradeId}&sectionId=${sectionId}&day=${selectedDay}&edit=true&periodId=${period.id}`
    );
  };

  const handleRefresh = () => {
    fetchTimetable();
  };

  const currentSchedule = timetableData.find(
    (item) => item.day === selectedDay
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Class Timetable</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <MaterialCommunityIcons name="sync" size={18} color={primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPeriod}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Period</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.daysOuterContainer}>
        <ScrollView
          ref={daysScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScrollContent}
        >
          {timetableData.map((dayData) => (
            <TouchableOpacity
              key={dayData.day}
              style={[
                styles.dayButton,
                selectedDay === dayData.day && styles.selectedDayButton,
              ]}
              onPress={() => setSelectedDay(dayData.day as Day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDay === dayData.day && styles.selectedDayButtonText,
                ]}
              >
                {dayData.day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scheduleContainer}
        contentContainerStyle={styles.scheduleContentContainer}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={styles.loadingText}>Loading timetable...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={50}
              color="#F44336"
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchTimetable}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : currentSchedule &&
          currentSchedule.periods &&
          currentSchedule.periods.length > 0 ? (
          currentSchedule.periods.map((period) => {
            const isExpanded = expandedPeriods.has(period.id);

            return (
              <View key={period.id} style={styles.periodCard}>
                <View
                  style={[
                    styles.periodColor,
                    { backgroundColor: period.color },
                  ]}
                />

                <View style={styles.periodTimeContainer}>
                  <Text style={styles.periodTime}>{period.time}</Text>
                </View>

                <TouchableOpacity
                  style={styles.periodDetails}
                  activeOpacity={0.7}
                  onPress={() => togglePeriodExpansion(period.id)}
                >
                  <View style={styles.periodMainInfo}>
                    <View style={styles.subjectContainer}>
                      <Text style={styles.periodSubject}>{period.subject}</Text>
                      <MaterialCommunityIcons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#666"
                      />
                    </View>

                    {period.teacher && (
                      <Text style={styles.periodTeacher}>
                        <MaterialCommunityIcons
                          name="account-outline"
                          size={14}
                          color="#666"
                        />{" "}
                        {period.teacher}
                      </Text>
                    )}
                  </View>

                  {isExpanded && (
                    <View style={styles.topicContainer}>
                      <Text style={styles.topicLabel}>Topic:</Text>
                      <Text style={styles.topicText}>
                        {period.topic || "No topic specified for this period"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.periodActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditPeriod(period)}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeletePeriod(period.id)}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color="#F44336"
                    />
                  </TouchableOpacity> */}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noPeriodsContainer}>
            <MaterialCommunityIcons name="timetable" size={50} color="#ddd" />
            <Text style={styles.noPeriodsText}>
              No periods scheduled for {selectedDay}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleAddPeriod}
            >
              <Text style={styles.emptyAddButtonText}>Add a period</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => hideAlert(true)}
        onCancel={() => hideAlert(false)}
        showCancelButton={alert.type === "warning"}
      />
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
    paddingTop: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    marginRight: 10,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
  daysOuterContainer: {
    height: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "center",
    paddingTop: 4,
  },
  daysScrollContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    height: 50,
  },
  dayButton: {
    height: 36,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 18,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayButton: {
    backgroundColor: primary,
  },
  dayButtonText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  selectedDayButtonText: {
    color: "#fff",
  },
  scheduleContainer: {
    flex: 1,
    padding: 16,
  },
  scheduleContentContainer: {
    paddingBottom: Platform.OS === "android" ? 80 : 20,
    minHeight: 300,
  },
  periodCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 84, // Adding minimum height for consistency
  },
  periodColor: {
    width: 6,
    height: "100%",
  },
  periodTimeContainer: {
    width: 90,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: "#f1f1f1",
    justifyContent: "center",
  },
  periodTime: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  periodDetails: {
    flex: 1,
    padding: 16,
  },
  periodMainInfo: {
    flexDirection: "column",
  },
  subjectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodSubject: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
    flex: 1,
  },
  periodTeacher: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 2,
  },
  periodRoom: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  topicContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  topicLabel: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    marginBottom: 2,
  },
  topicText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    lineHeight: 20,
  },
  periodActions: {
    paddingRight: 12,
    paddingLeft: 8,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    marginVertical: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: primary,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
  noPeriodsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noPeriodsText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
  },
  emptyAddButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: primary,
    borderRadius: 6,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
});

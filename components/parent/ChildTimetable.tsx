import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import { router } from "expo-router";
import { fetchSectionTimetable, TimetableEntry } from "@/services/timetableApi";

type Props = {
  sectionId: string;
};

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

export default function ChildTimetable({ sectionId }: Props) {
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
    const dayIndex = today === 0 ? 0 : today - 1;
    return dayIndex >= 0 && dayIndex < days.length ? days[dayIndex] : "Monday";
  };

  const [selectedDay, setSelectedDay] = useState<Day>(getTodayDayName());
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set()
  );
  const daysScrollViewRef = useRef<ScrollView>(null);
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

  // Fetch timetable data when day changes
  const fetchTimetable = useCallback(async () => {
    if (!sectionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSectionTimetable(sectionId, selectedDay);

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
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, selectedDay]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  useEffect(() => {
    const todayIndex = timetableData.findIndex(
      (day) => day.day === selectedDay
    );

    if (todayIndex >= 0 && daysScrollViewRef.current) {
      setTimeout(() => {
        daysScrollViewRef.current?.scrollTo({
          x: todayIndex * 80,
          animated: true,
        });
      }, 100);
    }
  }, [selectedDay, timetableData]);

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

  const currentSchedule = timetableData.find(
    (item) => item.day === selectedDay
  );

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
          <Text style={styles.title}>School Timetable</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchTimetable}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="sync" size={18} color={primary} />
        </TouchableOpacity>
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
              onPress={() => setSelectedDay(dayData.day)}
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
        ) : currentSchedule?.periods && currentSchedule.periods.length > 0 ? (
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

                  {isExpanded && (
                    <View style={styles.topicContainer}>
                      <Text style={styles.topicLabel}>Topic:</Text>
                      <Text style={styles.topicText}>
                        {period.topic || "No topic specified for this period"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.noScheduleContainer}>
            <MaterialCommunityIcons name="timetable" size={50} color="#ddd" />
            <Text style={styles.noScheduleText}>
              No classes scheduled for {selectedDay}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  refreshButton: {
    padding: 8,
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
  },
  periodTeacher: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 2,
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
  noScheduleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noScheduleText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
  },
});

import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type Period = {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  color: string;
  topic?: string; // Optional topic field
};

type DaySchedule = {
  day: Day;
  periods: Period[];
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
  const [timetableData, setTimetableData] = useState<DaySchedule[]>([
    {
      day: "Monday",
      periods: [
        {
          id: "m1",
          subject: "Mathematics",
          teacher: "Mrs. Smith",
          time: "08:00 - 09:30",
          color: "#4CAF50",
          topic: "Introduction to Algebra - Linear Equations",
        },
        {
          id: "m2",
          subject: "English",
          teacher: "Mr. Johnson",
          time: "09:45 - 11:15",
          color: "#2196F3",
        },
        {
          id: "m3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          color: "#9E9E9E",
        },
        {
          id: "m4",
          subject: "Science",
          teacher: "Mrs. Davis",
          time: "12:00 - 13:30",
          color: "#9C27B0",
        },
        {
          id: "m5",
          subject: "Physical Education",
          teacher: "Mr. Thompson",
          time: "13:45 - 15:15",
          color: "#FF9800",
        },
      ],
    },
    {
      day: "Tuesday",
      periods: [
        {
          id: "t1",
          subject: "History",
          teacher: "Mr. Wilson",
          time: "08:00 - 09:30",
          color: "#795548",
        },
        {
          id: "t2",
          subject: "Mathematics",
          teacher: "Mrs. Smith",
          time: "09:45 - 11:15",
          color: "#4CAF50",
        },
        {
          id: "t3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          color: "#9E9E9E",
        },
        {
          id: "t4",
          subject: "Art",
          teacher: "Ms. Garcia",
          time: "12:00 - 13:30",
          color: "#FF5722",
        },
        {
          id: "t5",
          subject: "English",
          teacher: "Mr. Johnson",
          time: "13:45 - 15:15",
          color: "#2196F3",
        },
      ],
    },
    {
      day: "Wednesday",
      periods: [
        {
          id: "w1",
          subject: "Science",
          teacher: "Mrs. Davis",
          time: "08:00 - 09:30",
          color: "#9C27B0",
        },
        {
          id: "w2",
          subject: "Music",
          teacher: "Mr. Martinez",
          time: "09:45 - 11:15",
          color: "#E91E63",
        },
        {
          id: "w3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          color: "#9E9E9E",
        },
        {
          id: "w4",
          subject: "Mathematics",
          teacher: "Mrs. Smith",
          time: "12:00 - 13:30",
          color: "#4CAF50",
        },
        {
          id: "w5",
          subject: "Computer Science",
          teacher: "Mr. Lee",
          time: "13:45 - 15:15",
          color: "#00BCD4",
        },
      ],
    },
    {
      day: "Thursday",
      periods: [
        {
          id: "th1",
          subject: "English",
          teacher: "Mr. Johnson",
          time: "08:00 - 09:30",
          color: "#2196F3",
        },
        {
          id: "th2",
          subject: "Social Studies",
          teacher: "Mrs. Anderson",
          time: "09:45 - 11:15",
          color: "#607D8B",
        },
        {
          id: "th3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          color: "#9E9E9E",
        },
        {
          id: "th4",
          subject: "Science",
          teacher: "Mrs. Davis",
          time: "12:00 - 13:30",
          color: "#9C27B0",
        },
        {
          id: "th5",
          subject: "Study Hall",
          teacher: "Ms. Taylor",
          time: "13:45 - 15:15",
          color: "#3F51B5",
        },
      ],
    },
    {
      day: "Friday",
      periods: [
        {
          id: "f1",
          subject: "Mathematics",
          teacher: "Mrs. Smith",
          time: "08:00 - 09:30",
          color: "#4CAF50",
        },
        {
          id: "f2",
          subject: "Language",
          teacher: "Ms. Rodriguez",
          time: "09:45 - 11:15",
          color: "#009688",
        },
        {
          id: "f3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          color: "#9E9E9E",
        },
        {
          id: "f4",
          subject: "Health",
          teacher: "Mrs. White",
          time: "12:00 - 13:30",
          color: "#F44336",
        },
        {
          id: "f5",
          subject: "Club Activities",
          teacher: "Various",
          time: "13:45 - 15:15",
          color: "#CDDC39",
        },
      ],
    },
    {
      day: "Saturday",
      periods: [
        {
          id: "s1",
          subject: "Extra Mathematics",
          teacher: "Mrs. Smith",
          time: "09:00 - 10:30",
          color: "#4CAF50",
        },
        {
          id: "s2",
          subject: "Art Club",
          teacher: "Ms. Garcia",
          time: "10:45 - 12:15",
          color: "#FF5722",
        },
      ],
    },
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

  const handleEditPeriod = (period: Period) => {
    router.push(
      `/(teacher)/timetable/add?branchId=${branchId}&gradeId=${gradeId}&sectionId=${sectionId}&day=${selectedDay}&edit=true&periodId=${period.id}`
    );
  };

  const handleDeletePeriod = (periodId: string) => {
    showAlert(
      "Delete Period",
      "Are you sure you want to delete this period? This action cannot be undone.",
      "warning",
      () => {
        // First close the confirmation alert
        setAlert((prev) => ({ ...prev, visible: false }));

        // Then delete the period
        setTimetableData((prevData) =>
          prevData.map((daySchedule) => {
            if (daySchedule.day === selectedDay) {
              return {
                ...daySchedule,
                periods: daySchedule.periods.filter(
                  (period) => period.id !== periodId
                ),
              };
            }
            return daySchedule;
          })
        );

        // After deleting, show the success alert
        setTimeout(() => {
          showAlert(
            "Success",
            "The period has been deleted successfully",
            "success"
          );
        }, 100);
      },
      () => {
        console.log("Delete operation canceled");
      }
    );
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddPeriod}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add Period</Text>
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
        {currentSchedule?.periods.map((period) => {
          const isExpanded = expandedPeriods.has(period.id);
          const hasTopic = Boolean(period.topic);

          return (
            <View key={period.id} style={styles.periodCard}>
              <View
                style={[styles.periodColor, { backgroundColor: period.color }]}
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
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeletePeriod(period.id)}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="#F44336"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
});

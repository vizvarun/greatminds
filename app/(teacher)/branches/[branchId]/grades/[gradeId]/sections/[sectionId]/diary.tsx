import React, { useCallback, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";

type DiaryEntry = {
  id: string;
  date: string;
  formattedDate: string;
  title: string;
  description: string;
  type:
    | "homework"
    | "classwork"
    | "preparation"
    | "research"
    | "note"
    | "reminder"
    | "test";
  completed?: boolean;
};

export default function SectionDiaryScreen() {
  const { branchId, gradeId, sectionId } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Sample diary entries - would come from API in real app
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([
    {
      id: "1",
      date: new Date().toISOString().split("T")[0], // Today
      formattedDate: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Math Quiz on Algebra",
      description: "Chapters 5-7 covering polynomial equations",
      type: "test",
    },
    {
      id: "2",
      date: new Date().toISOString().split("T")[0], // Today
      formattedDate: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Science Homework Due",
      description: "Complete exercise 3 in the workbook",
      type: "homework",
      completed: false,
    },
    {
      id: "3",
      date: new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .split("T")[0], // Tomorrow
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 1)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "English Essay Due",
      description: "2-page essay on Shakespeare's Hamlet",
      type: "homework",
      completed: false,
    },
    {
      id: "4",
      date: new Date(new Date().setDate(new Date().getDate() + 2))
        .toISOString()
        .split("T")[0],
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 2)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Group Project Work",
      description: "In-class group project on renewable energy",
      type: "classwork",
    },
    {
      id: "5",
      date: new Date(new Date().setDate(new Date().getDate() + 3))
        .toISOString()
        .split("T")[0],
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 3)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Research Assignment",
      description: "Research historical figures for upcoming project",
      type: "research",
    },
  ]);

  // Add rotation animation value
  const syncIconRotation = useRef(new Animated.Value(0)).current;

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Start rotation animation
    Animated.loop(
      Animated.timing(syncIconRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Simulate fetching data from server
    setTimeout(() => {
      // Reset date to today on sync
      const today = new Date();
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setSelectedDate(normalizeDate(today));
      setShowDatePicker(false);

      showAlert(
        "Diary Updated",
        "The class diary has been refreshed",
        "success"
      );
      setRefreshing(false);
      // Stop rotation animation
      syncIconRotation.setValue(0);
      Animated.timing(syncIconRotation).stop();
    }, 1000);
  }, [showAlert, syncIconRotation]);

  // Create an interpolation for rotation
  const spin = syncIconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Add a helper function to normalize dates for consistent comparison
  const normalizeDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(normalizeDate(today));
    setShowDatePicker(false);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return d.toLocaleDateString("en-US", options);
  };

  const formatDisplayDate = (date: string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return d.toLocaleDateString("en-US", options);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(normalizeDate(newDate));
    setShowDatePicker(false);
  };

  const changeMonth = (increment: number) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const days = [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Add header with month and year
    days.push(
      <View key="header" style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    );

    // Add day names row
    days.push(
      <View key="daynames" style={styles.dayNamesRow}>
        {dayNames.map((day) => (
          <Text key={day} style={styles.dayName}>
            {day}
          </Text>
        ))}
      </View>
    );

    // Add empty cells for days before the first day of the month
    const rows = [];
    let cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentYear, currentMonth, day);
      const dateString = normalizeDate(cellDate);
      const isSelected = dateString === selectedDate;

      const today = new Date();
      const todayString = normalizeDate(today);

      const isToday = dateString === todayString;
      const hasEntries = diaryEntries.some(
        (entry) => entry.date === dateString
      );

      cells.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isToday && styles.todayCell]}
          onPress={() => handleDateSelect(day)}
        >
          <View style={[isSelected && styles.selectedDay]}>
            <Text
              style={[
                styles.dayText,
                isToday && !isSelected && styles.todayText,
                isSelected && styles.selectedDayText,
              ]}
            >
              {day}
            </Text>
          </View>
          {hasEntries && <View style={styles.entryIndicator} />}
        </TouchableOpacity>
      );

      // If we've reached the end of a week, start a new row
      if ((firstDay + day) % 7 === 0) {
        rows.push(
          <View key={`row-${day}`} style={styles.calendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    }

    // Add any remaining days to a final row
    if (cells.length > 0) {
      while (cells.length < 7) {
        cells.push(
          <View key={`empty-end-${cells.length}`} style={styles.emptyDay} />
        );
      }
      rows.push(
        <View key="row-final" style={styles.calendarRow}>
          {cells}
        </View>
      );
    }

    days.push(...rows);

    return <View style={styles.customCalendar}>{days}</View>;
  };

  const handleAddEntry = () => {
    router.push(
      `/(teacher)/diary/add?branchId=${branchId}&gradeId=${gradeId}&sectionId=${sectionId}&date=${selectedDate}`
    );
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    router.push(
      `/(teacher)/diary/add?branchId=${branchId}&gradeId=${gradeId}&sectionId=${sectionId}&date=${selectedDate}&edit=true&entryId=${entry.id}`
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    showAlert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      "warning",
      () => {
        // Delete the entry only after confirmation
        setDiaryEntries(diaryEntries.filter((entry) => entry.id !== entryId));
      }
    );
  };

  const entriesForSelectedDate = diaryEntries.filter(
    (entry) => entry.date === selectedDate
  );

  const getIconForEntryType = (type: DiaryEntry["type"]) => {
    switch (type) {
      case "homework":
        return "book-open-variant";
      case "classwork":
        return "pencil-outline";
      case "preparation":
        return "clipboard-outline";
      case "research":
        return "magnify";
      case "test":
        return "file-document-outline";
      case "reminder":
        return "bell-outline";
      case "note":
        return "note-outline";
      default:
        return "information-outline";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Diary</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <MaterialCommunityIcons name="sync" size={20} color={primary} />
            </Animated.View>
            <Text style={styles.refreshButtonText}>Sync</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={primary} />
          <Text style={styles.dateSelectorText}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <MaterialCommunityIcons
            name={showDatePicker ? "chevron-up" : "chevron-down"}
            size={20}
            color={primary}
          />
        </TouchableOpacity>

        {showDatePicker && renderCalendar()}

        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.entriesContainer}>
        <Text style={styles.dateHeader}>{formatDate(selectedDate)}</Text>

        {entriesForSelectedDate.length > 0 ? (
          <FlatList
            data={entriesForSelectedDate}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.entriesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.entryCard}>
                <View
                  style={[
                    styles.entryIconContainer,
                    item.type === "homework"
                      ? styles.homeworkIcon
                      : item.type === "classwork"
                      ? styles.classworkIcon
                      : item.type === "preparation"
                      ? styles.preparationIcon
                      : item.type === "research"
                      ? styles.researchIcon
                      : item.type === "test"
                      ? styles.testIcon
                      : item.type === "reminder"
                      ? styles.reminderIcon
                      : styles.noteIcon,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getIconForEntryType(item.type)}
                    size={24}
                    color="#fff"
                  />
                </View>
                <View style={styles.entryContent}>
                  <Text style={styles.entryTitle}>{item.title}</Text>
                  <Text style={styles.entryDescription}>
                    {item.description}
                  </Text>
                  {item.type === "homework" && (
                    <View style={styles.homeworkStatus}>
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: item.completed ? "#4CAF50" : "#FF9800",
                          },
                        ]}
                      >
                        {item.completed ? "Completed" : "Pending"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.entryActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditEntry(item)}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteEntry(item.id)}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color="#F44336"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.noEntriesContainer}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={50}
              color="#ddd"
            />
            <Text style={styles.noEntriesText}>
              No diary entries for this date
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleAddEntry}
            >
              <Text style={styles.emptyAddButtonText}>Add an entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  refreshButtonText: {
    marginLeft: 4,
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
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
  todayButton: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    borderRadius: 20,
  },
  todayButtonText: {
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
  entriesContainer: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 12,
  },
  entriesList: {
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  homeworkIcon: {
    backgroundColor: "#4CAF50", // Green
  },
  classworkIcon: {
    backgroundColor: "#00BCD4", // Cyan
  },
  preparationIcon: {
    backgroundColor: "#3F51B5", // Indigo
  },
  researchIcon: {
    backgroundColor: "#673AB7", // Deep Purple
  },
  testIcon: {
    backgroundColor: "#F44336", // Red
  },
  reminderIcon: {
    backgroundColor: "#FF9800", // Orange
  },
  noteIcon: {
    backgroundColor: "#2196F3", // Blue
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 8,
  },
  homeworkStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  entryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 6,
    marginLeft: 5,
  },
  noEntriesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noEntriesText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
  },
  emptyAddButton: {
    marginTop: 20,
    backgroundColor: primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 181, 191, 0.05)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dateSelectorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  customCalendar: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  calendarTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  dayNamesRow: {
    flexDirection: "row",
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dayName: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  calendarRow: {
    flexDirection: "row",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    height: 40,
  },
  todayCell: {
    backgroundColor: "rgba(11, 181, 191, 0.05)",
  },
  emptyDay: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  todayText: {
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  selectedDay: {
    backgroundColor: primary,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  selectedDayText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  entryIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderRightColor: "transparent",
    borderTopColor: primary,
  },
});

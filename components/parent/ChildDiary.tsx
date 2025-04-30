import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState, useRef } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";
import { router } from "expo-router";

type Props = {
  childId: string;
  showAlert: (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
};

type DiaryEntry = {
  id: string;
  date: string;
  formattedDate: string;
  title: string;
  description: string;
  type: "homework" | "note" | "reminder" | "test";
};

export default function ChildDiary({ childId, showAlert }: Props) {
  const normalizeDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([
    {
      id: "6",
      date: normalizeDate(new Date()),
      formattedDate: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Today's Math Quiz",
      description: "Algebra quiz covering last week's material",
      type: "test",
    },
    {
      id: "7",
      date: normalizeDate(new Date()),
      formattedDate: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Homework Submission",
      description: "Submit science project outline",
      type: "homework",
    },
    {
      id: "8",
      date: normalizeDate(
        new Date(new Date().setDate(new Date().getDate() + 1))
      ),
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 1)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "French Vocabulary Test",
      description: "Chapters 7-9 vocabulary will be tested",
      type: "test",
    },
    {
      id: "9",
      date: normalizeDate(
        new Date(new Date().setDate(new Date().getDate() + 2))
      ),
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 2)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Geography Project Due",
      description: "Submit completed world map project",
      type: "homework",
    },
    {
      id: "10",
      date: normalizeDate(
        new Date(new Date().setDate(new Date().getDate() + 3))
      ),
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 3)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Library Books Return",
      description: "Return all borrowed books to avoid late fees",
      type: "reminder",
    },
    {
      id: "11",
      date: normalizeDate(
        new Date(new Date().setDate(new Date().getDate() + 5))
      ),
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 5)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Sports Day Preparation",
      description: "Bring sports uniform and water bottle",
      type: "note",
    },
    {
      id: "12",
      date: normalizeDate(
        new Date(new Date().setDate(new Date().getDate() + 7))
      ),
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 7)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "History Presentation",
      description: "Group presentation on Ancient Egypt",
      type: "homework",
    },
    {
      id: "13",
      date: normalizeDate(
        new Date(new Date().setDate(new Date().getDate() + 14))
      ),
      formattedDate: new Date(
        new Date().setDate(new Date().getDate() + 14)
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "End of Term Exam",
      description: "Final mathematics examination for the term",
      type: "test",
    },
    {
      id: "14",
      date: normalizeDate(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20)
      ),
      formattedDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        20
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Last Month Assignment",
      description: "Science lab report on plant growth experiment",
      type: "homework",
    },
    {
      id: "15",
      date: normalizeDate(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10)
      ),
      formattedDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        10
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: "Future School Event",
      description: "Annual science fair participation confirmation",
      type: "reminder",
    },
  ]);

  const syncIconRotation = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    Animated.loop(
      Animated.timing(syncIconRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    setTimeout(() => {
      const today = new Date();
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setSelectedDate(normalizeDate(today));
      setShowDatePicker(false);

      showAlert(
        "Diary Updated",
        "Your child's diary has been refreshed",
        "success"
      );
      setRefreshing(false);
      syncIconRotation.setValue(0);
      Animated.timing(syncIconRotation).stop();
    }, 1000);
  }, [showAlert, syncIconRotation]);

  const spin = syncIconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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

    days.push(
      <View key="daynames" style={styles.dayNamesRow}>
        {dayNames.map((day) => (
          <Text key={day} style={styles.dayName}>
            {day}
          </Text>
        ))}
      </View>
    );

    const rows = [];
    let cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

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

      if ((firstDay + day) % 7 === 0) {
        rows.push(
          <View key={`row-${day}`} style={styles.calendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    }

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

  const entriesForSelectedDate = diaryEntries.filter(
    (entry) => entry.date === selectedDate
  );

  const getIconForEntryType = (type: DiaryEntry["type"]) => {
    switch (type) {
      case "homework":
        return "book-open-variant";
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
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>School Diary</Text>
        </View>
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
          </View>
        )}
      </View>
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
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButtonText: {
    marginLeft: 4,
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
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
    backgroundColor: "#4CAF50",
  },
  testIcon: {
    backgroundColor: "#F44336",
  },
  reminderIcon: {
    backgroundColor: "#FF9800",
  },
  noteIcon: {
    backgroundColor: "#2196F3",
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

import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import {
  fetchSectionDiaryEntries,
  deleteDiaryEntry,
} from "@/services/diaryApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SectionList,
  Linking,
} from "react-native";

type DiaryEntry = {
  id: string;
  date: string;
  formattedDate: string;
  title: string;
  description: string;
  isUrgent: boolean;
  type:
    | "homework"
    | "classwork"
    | "preparation"
    | "research"
    | "note"
    | "reminder"
    | "test";
  link?: string;
};

const entryTypes = [
  {
    id: "homework",
    name: "Homework",
    icon: "book-open-variant",
    color: "#4CAF50",
  },
  {
    id: "classwork",
    name: "Classwork",
    icon: "pencil-outline",
    color: "#00BCD4",
  },
  {
    id: "preparation",
    name: "Preparation",
    icon: "clipboard-outline",
    color: "#F44336",
  },
  {
    id: "research",
    name: "Research",
    icon: "magnify",
    color: "#673AB7",
  },
  {
    id: "test",
    name: "Test",
    icon: "file-document-outline",
    color: "#F44336",
  },
  {
    id: "reminder",
    name: "Reminder",
    icon: "bell-outline",
    color: "#FF9800",
  },
  {
    id: "note",
    name: "Note",
    icon: "note-outline",
    color: "#200F13",
  },
];

export default function SectionDiaryScreen() {
  const { branchId, gradeId, sectionId } = useLocalSearchParams();

  const normalizeDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const syncIconRotation = useRef(new Animated.Value(0)).current;

  const [dateRange, setDateRange] = useState<Date[]>([]);
  const dateScrollRef = useRef<FlatList>(null);

  useEffect(() => {
    const generateDateRange = () => {
      const today = new Date();
      const dates: Date[] = [];

      for (let i = -14; i <= 14; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        dates.push(date);
      }

      setDateRange(dates);
    };

    generateDateRange();
  }, []);

  useEffect(() => {
    if (dateRange.length > 0 && dateScrollRef.current) {
      const todayIndex = dateRange.findIndex(
        (date) => normalizeDate(date) === normalizeDate(new Date())
      );

      const selectedIndex = selectedDate
        ? dateRange.findIndex((date) => normalizeDate(date) === selectedDate)
        : todayIndex;

      if (selectedIndex !== -1) {
        dateScrollRef.current.scrollToIndex({
          index: selectedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  }, [dateRange, selectedDate]);

  useEffect(() => {
    fetchDiaryEntries();
  }, [sectionId, selectedDate]);

  const fetchDiaryEntries = async () => {
    if (!sectionId) return;

    setError(null);
    if (!refreshing) setIsLoading(true);

    try {
      const response = await fetchSectionDiaryEntries(
        sectionId as string,
        selectedDate
      );

      if (Array.isArray(response.items)) {
        const transformedEntries: DiaryEntry[] = response.items.map((entry) => {
          let type: DiaryEntry["type"] = "note";
          const noteType = entry.notetype?.toLowerCase() || "";

          if (noteType.includes("home") || noteType.includes("homework")) {
            type = "homework";
          } else if (noteType.includes("test") || noteType.includes("quiz")) {
            type = "test";
          } else if (noteType.includes("research")) {
            type = "research";
          } else if (noteType.includes("prep")) {
            type = "preparation";
          } else if (noteType.includes("class")) {
            type = "classwork";
          } else if (noteType.includes("remind")) {
            type = "reminder";
          }

          const title = entry.subject
            ? `${entry.notetype}: ${entry.subject}`
            : entry.notetype;

          const entryDate = new Date(entry.effectivedate);

          return {
            id: entry.id.toString(),
            date: normalizeDate(entryDate),
            formattedDate: entryDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            title: title,
            description: entry.description,
            isUrgent: entry.isurgent || false,
            type,
            link: entry.link,
          };
        });

        setDiaryEntries(transformedEntries);
      } else {
        console.warn("Unexpected API response format:", response);
        setDiaryEntries([]);
      }
    } catch (err) {
      console.error("Failed to fetch diary entries:", err);
      setError("Failed to load diary entries. Please try again.");
      showAlert("Error", "Failed to load diary entries", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      syncIconRotation.setValue(0);
      Animated.timing(syncIconRotation).stop();
    }
  };

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

    Animated.loop(
      Animated.timing(syncIconRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    setSelectedDate(null);
    setShowDatePicker(false);

    fetchDiaryEntries();
  }, [sectionId, syncIconRotation]);

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

  const formatDisplayDate = (date: string | null) => {
    if (!date) return "All Entries";

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

  const clearDateFilter = () => {
    setSelectedDate(null);
    setShowDatePicker(false);
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

  const handleDeleteEntry = async (entryId: string) => {
    showAlert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      "warning",
      async () => {
        try {
          setIsLoading(true);
          await deleteDiaryEntry(entryId);

          setDiaryEntries(diaryEntries.filter((entry) => entry.id !== entryId));

          showAlert("Success", "Entry deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting entry:", error);
          showAlert(
            "Error",
            "Failed to delete entry. Please try again.",
            "error"
          );
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const groupEntriesByDate = (entries: DiaryEntry[]) => {
    const grouped: { title: string; data: DiaryEntry[] }[] = [];
    const dateMap = new Map<string, DiaryEntry[]>();

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedEntries.forEach((entry) => {
      const formattedDate = formatDate(entry.date);
      if (!dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, []);
      }
      dateMap.get(formattedDate)?.push(entry);
    });

    dateMap.forEach((entries, date) => {
      grouped.push({
        title: date,
        data: entries,
      });
    });

    return grouped;
  };

  const entriesForSelectedDate = selectedDate
    ? diaryEntries.filter((entry) => entry.date === selectedDate)
    : diaryEntries;

  const groupedEntries = selectedDate ? [] : groupEntriesByDate(diaryEntries);

  const renderEntryItem = ({ item }: { item: DiaryEntry }) => {
    const entryType =
      entryTypes.find((et) => et.id === item.type) || entryTypes[6];

    const openLink = async (url: string) => {
      try {
        let urlToOpen = url.trim();
        if (
          !urlToOpen.startsWith("http://") &&
          !urlToOpen.startsWith("https://")
        ) {
          urlToOpen = "https://" + urlToOpen;
        }
        await Linking.openURL(urlToOpen);
      } catch (error) {
        showAlert("Error", "Failed to open the URL", "error");
      }
    };

    return (
      <View style={styles.entryCard}>
        <View
          style={[styles.entryAccent, { backgroundColor: entryType.color }]}
        />

        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <View style={styles.entryTypeContainer}>
              <MaterialCommunityIcons
                name={entryType.icon}
                size={15}
                color={entryType.color}
                style={styles.entryTypeIcon}
              />
              <Text style={[styles.entryTypeLabel, { color: entryType.color }]}>
                {entryType.name}
              </Text>
              {item.isUrgent && (
                <View style={styles.urgentPill}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
            </View>

            <View style={styles.entryActions}>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => handleEditEntry(item)}
              >
                <MaterialCommunityIcons name="pencil" size={18} color="#888" />
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.deleteButton}
                onPress={() => handleDeleteEntry(item.id)}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={18}
                  color="#F44336"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.entryTitle}>{item.title}</Text>

          <Text style={styles.entryDescription}>{item.description}</Text>
          {item.link ? (
            <View style={styles.previewButton}>
              <TouchableOpacity
                accessibilityLabel="Open link in browser"
                style={styles.linkIcon}
                onPress={() => openLink(item.link!)}
              >
                <Text style={styles.openLinkText}>Open Link</Text>
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={18}
                  color={primary}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderDateHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.dateHeaderContainer}>
      <Text style={styles.sectionDateHeader}>{section.title}</Text>
    </View>
  );

  const formatScrollerDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (normalizeDate(date) === normalizeDate(today)) {
      return "Today";
    } else if (normalizeDate(date) === normalizeDate(tomorrow)) {
      return "Tomorrow";
    } else if (normalizeDate(date) === normalizeDate(yesterday)) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = normalizeDate(item) === selectedDate;
    const isToday = normalizeDate(item) === normalizeDate(new Date());
    const hasEntries = diaryEntries.some(
      (entry) => entry.date === normalizeDate(item)
    );

    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          isSelected && styles.dateItemSelected,
          isToday && !isSelected && styles.dateItemToday,
        ]}
        onPress={() => setSelectedDate(normalizeDate(item))}
      >
        <Text
          style={[
            styles.dateDay,
            isSelected && styles.dateTextSelected,
            isToday && !isSelected && styles.dateTodayText,
          ]}
        >
          {item.getDate()}
        </Text>
        <Text
          style={[
            styles.dateMonth,
            isSelected && styles.dateTextSelected,
            isToday && !isSelected && styles.dateTodayText,
          ]}
        >
          {item.toLocaleDateString("en-US", { month: "short" })}
        </Text>
        <Text
          style={[
            styles.dateWeekday,
            isSelected && styles.dateTextSelected,
            isToday && !isSelected && styles.dateTodayText,
          ]}
        >
          {formatScrollerDate(item).includes("day")
            ? formatScrollerDate(item)
            : item.toLocaleDateString("en-US", { weekday: "short" })}
        </Text>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.title}>Class Diary</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerActionButton, styles.addEntryHeaderButton]}
            onPress={handleAddEntry}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.addEntryHeaderText}>Add Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <MaterialCommunityIcons name="sync" size={20} color="#555" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateNavigationContainer}>
        <TouchableOpacity
          style={[
            styles.dateNavButton,
            !selectedDate && styles.dateNavButtonActive,
          ]}
          onPress={clearDateFilter}
        >
          <Text
            style={[
              styles.dateNavText,
              !selectedDate && styles.dateNavTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dateNavButton,
            selectedDate === normalizeDate(new Date()) &&
              styles.dateNavButtonActive,
          ]}
          onPress={goToToday}
        >
          <Text
            style={[
              styles.dateNavText,
              selectedDate === normalizeDate(new Date()) &&
                styles.dateNavTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <MaterialCommunityIcons
            name={showDatePicker ? "calendar-remove" : "calendar"}
            size={18}
            color={primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dateScrollerContainer}>
        <FlatList
          ref={dateScrollRef}
          data={dateRange}
          horizontal
          showsHorizontalScrollIndicator={true}
          renderItem={renderDateItem}
          keyExtractor={(item) => normalizeDate(item)}
          contentContainerStyle={styles.dateScrollerContent}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              dateScrollRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
              });
            });
          }}
        />
      </View>

      {showDatePicker && (
        <View style={styles.calendarWrapper}>{renderCalendar()}</View>
      )}

      <View style={styles.entriesContainer}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={styles.loadingText}>Loading diary entries...</Text>
          </View>
        ) : error ? (
          <View style={styles.noEntriesContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={50}
              color="#F44336"
            />
            <Text style={styles.noEntriesText}>{error}</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={fetchDiaryEntries}
            >
              <Text style={styles.emptyAddButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : entriesForSelectedDate.length > 0 ? (
          selectedDate ? (
            <FlatList
              data={entriesForSelectedDate}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.entriesList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={renderEntryItem}
            />
          ) : (
            <SectionList
              sections={groupedEntries}
              keyExtractor={(item) => item.id}
              renderItem={renderEntryItem}
              renderSectionHeader={renderDateHeader}
              contentContainerStyle={styles.entriesList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              stickySectionHeadersEnabled={false}
            />
          )
        ) : (
          <View style={styles.noEntriesContainer}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={50}
              color="#ddd"
            />
            <Text style={styles.noEntriesText}>
              {selectedDate
                ? "No diary entries for this date"
                : "No diary entries found"}
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
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  addEntryHeaderButton: {
    backgroundColor: primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addEntryHeaderText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  dateBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currentDate: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateNavButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  dateNavButtonActive: {
    backgroundColor: primary,
  },
  dateNavText: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  dateNavTextActive: {
    color: "#fff",
  },
  calendarButton: {
    padding: 6,
    borderRadius: 16,
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: primary + "50",
  },
  dateScrollerContainer: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateScrollerContent: {
    paddingHorizontal: 8,
  },
  dateItem: {
    width: 64,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    position: "relative",
    paddingVertical: 8,
  },
  dateItemSelected: {
    backgroundColor: primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateItemToday: {
    backgroundColor: "#f0f7f8",
    borderWidth: 1.5,
    borderColor: primary,
  },
  dateDay: {
    fontSize: 22,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.regular.primary,
    color: "#666",
    marginBottom: 1,
  },
  dateWeekday: {
    fontSize: 11,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#888",
  },
  dateTextSelected: {
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  dateTodayText: {
    color: primary,
    fontWeight: "700",
  },
  dateEntryDot: {
    position: "absolute",
    bottom: 14,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#666",
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 12,
  },
  entriesContainer: {
    flex: 1,
  },
  entriesList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  dateHeaderContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "#f8f9fa",
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  sectionDateHeader: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  entryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  entryAccent: {
    width: 4,
    height: "100%",
  },
  entryContent: {
    flex: 1,
    padding: 14,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  entryTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryTypeIcon: {
    marginRight: 4,
  },
  entryTypeLabel: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  urgentPill: {
    marginLeft: 8,
    backgroundColor: "#FFE0E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentText: {
    color: "#F44336",
    fontSize: 10,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  entryTitle: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
    marginBottom: 6,
  },
  entryDescription: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    lineHeight: 20,
  },
  entryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
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
  customCalendar: {
    backgroundColor: "#fff",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    backgroundColor: "rgba(11, 181, 191, 0.08)",
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
    fontFamily: Typography.fontWeight.bold.primary,
  },
  selectedDay: {
    backgroundColor: primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedDayText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.bold.primary,
    fontSize: 15,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  entryIndicator: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderRightColor: "transparent",
    borderTopColor: primary,
  },
  previewButton: {
    paddingVertical: 4,
  },
  linkIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  openLinkText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    lineHeight: 20,
    marginRight: 6,
  },
});

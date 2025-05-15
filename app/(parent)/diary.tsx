import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { fetchDiaryEntries } from "@/services/diaryApi";
import { useAuth } from "@/context/AuthContext";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";

// Define diary entry type
type DiaryEntry = {
  id: string;
  date: string;
  formattedDate: string;
  title: string;
  description: string;
  isUrgent: boolean;
  type: string;
};

export default function ParentDiaryScreen() {
  // Local params
  const params = useLocalSearchParams();
  const { userProfile } = useAuth();

  // State variables
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const [dateRange, setDateRange] = useState<Date[]>([]);
  const dateScrollRef = useRef<FlatList>(null);

  // Define normalizeDate function
  const normalizeDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Alert functions
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

  // Fetch diary entries
  const loadDiaryEntries = async () => {
    if (!userProfile?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchDiaryEntries(
        userProfile.user.id.toString(),
        selectedDate
      );

      if (Array.isArray(response?.items)) {
        const formattedEntries = response.items.map((entry: any) => ({
          id: entry.id.toString(),
          date: normalizeDate(new Date(entry.effectivedate)),
          formattedDate: formatDate(new Date(entry.effectivedate)),
          title: entry.subject || entry.notetype || "No Title",
          description: entry.description || "",
          isUrgent: entry.isurgent || false,
          type: entry.notetype?.toLowerCase() || "note",
        }));

        setDiaryEntries(formattedEntries);
      } else {
        setDiaryEntries([]);
      }
    } catch (error) {
      console.error("Failed to fetch diary entries:", error);
      setError("Failed to load diary entries. Please try again.");
      showAlert("Error", "Failed to load diary entries", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Clear date filter function
  const clearDateFilter = () => {
    setSelectedDate(null);
    setShowDatePicker(false);
  };

  // Go to today function
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(normalizeDate(today));
    setShowDatePicker(false);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Group entries by date
  const groupEntriesByDate = (entries: DiaryEntry[]) => {
    const grouped: { title: string; data: DiaryEntry[] }[] = [];
    const dateMap = new Map<string, DiaryEntry[]>();

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group entries by formatted date
    sortedEntries.forEach((entry) => {
      const formattedDate = entry.formattedDate;
      if (!dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, []);
      }
      dateMap.get(formattedDate)?.push(entry);
    });

    // Convert map to array for SectionList
    dateMap.forEach((entries, date) => {
      grouped.push({
        title: date,
        data: entries,
      });
    });

    return grouped;
  };

  // Fetch entries when component mounts or dependencies change
  useEffect(() => {
    loadDiaryEntries();
  }, [userProfile?.user?.id, selectedDate]);

  // Generate date range for scroller
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

  // Handle scrolling to selected date
  useEffect(() => {
    if (dateRange.length > 0 && dateScrollRef.current) {
      const todayIndex = dateRange.findIndex(
        (date) => normalizeDate(date) === normalizeDate(new Date())
      );

      const selectedIndex = selectedDate
        ? dateRange.findIndex((date) => normalizeDate(date) === selectedDate)
        : todayIndex;

      if (selectedIndex !== -1) {
        setTimeout(() => {
          dateScrollRef.current?.scrollToIndex({
            index: selectedIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }, 100);
      }
    }
  }, [dateRange, selectedDate, diaryEntries?.length]);

  const formatScrollerDate = (date: Date) => {
    const today = new Date();
    if (normalizeDate(date) === normalizeDate(today)) {
      return "Today";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
      });
    }
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = normalizeDate(item) === selectedDate;
    const isToday = normalizeDate(item) === normalizeDate(new Date());
    const hasEntries = diaryEntries?.some(
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
        <View style={styles.dateItemContent}>
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
            {isToday ? "Today" : formatScrollerDate(item)}
          </Text>
          {hasEntries && (
            <View
              style={[
                styles.dateEntryDot,
                isSelected && { backgroundColor: "white" },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render entry item
  const renderEntryItem = ({ item }: { item: DiaryEntry }) => {
    return (
      <View style={styles.entryCard}>
        <View
          style={[
            styles.entryAccent,
            { backgroundColor: getTypeColor(item.type) },
          ]}
        />

        <View style={styles.entryContent}>
          <Text style={styles.entryTitle}>{item.title}</Text>
          <Text style={styles.entryDescription}>{item.description}</Text>

          {item.isUrgent && (
            <View style={styles.urgentTag}>
              <MaterialCommunityIcons name="alert" size={14} color="#F44336" />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  // Helper function to get color based on entry type
  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "homework":
        return "#4CAF50";
      case "classwork":
        return "#00BCD4";
      case "preparation":
        return "#F44336";
      case "research":
        return "#673AB7";
      case "test":
        return "#F44336";
      case "reminder":
        return "#FF9800";
      default:
        return "#607D8B";
    }
  };

  // Filter entries based on selected date
  const filteredEntries = selectedDate
    ? diaryEntries.filter((entry) => entry.date === selectedDate)
    : diaryEntries;

  const groupedEntries = selectedDate ? [] : groupEntriesByDate(diaryEntries);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Diary</Text>
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
          showsHorizontalScrollIndicator={false}
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

      {/* Calendar picker would go here */}

      <View style={styles.entriesContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={styles.loadingText}>Loading diary entries...</Text>
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
              onPress={loadDiaryEntries}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredEntries.length > 0 ? (
          selectedDate ? (
            <FlatList
              data={filteredEntries}
              renderItem={renderEntryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.entryList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadDiaryEntries();
                  }}
                />
              }
            />
          ) : (
            <SectionList
              sections={groupedEntries}
              renderItem={renderEntryItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.entryList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadDiaryEntries();
                  }}
                />
              }
              stickySectionHeadersEnabled={true}
            />
          )
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={70}
              color="#ddd"
            />
            <Text style={styles.emptyText}>
              {selectedDate
                ? "No entries for this date"
                : "No diary entries found"}
            </Text>
          </View>
        )}
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={hideAlert}
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
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateScrollerContent: {
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  dateItem: {
    width: 70,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  dateItemContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dateItemSelected: {
    backgroundColor: primary,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateItemToday: {
    backgroundColor: primary + "15",
    borderWidth: 1,
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
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  dateWeekday: {
    fontSize: 11,
    fontFamily: Typography.fontWeight.regular.primary,
    color: "#777",
    marginTop: 2,
  },
  dateTextSelected: {
    color: "#fff",
  },
  dateTodayText: {
    color: primary,
  },
  dateEntryDot: {
    position: "absolute",
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: primary,
  },
  entriesContainer: {
    flex: 1,
  },
  entryList: {
    padding: 12,
  },
  sectionHeader: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  entryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
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
  urgentTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  urgentText: {
    color: "#F44336",
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
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
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  retryButton: {
    backgroundColor: primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
  },
});

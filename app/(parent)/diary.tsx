import { FlatList } from "react-native";
import { useRef, useEffect, useState } from "react";

export default function ParentDiaryScreen() {
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

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});

import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { fetchSectionGalleryGroups, GalleryGroup } from "@/services/galleryApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  PanResponder,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function normalizeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d
    .toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/\./g, "");
}

export default function ParentGalleryScreen() {
  const { sectionId } = useLocalSearchParams();
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const dateScrollRef = useRef<FlatList>(null);

  // Image preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewGroupImages, setPreviewGroupImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  // PanResponder for swipe gestures in preview modal
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 30,
      onPanResponderRelease: (_, gestureState) => {
        if (
          gestureState.dx < -40 &&
          previewGroupImages.length > 1 &&
          previewIndex < previewGroupImages.length - 1
        ) {
          const newIndex = previewIndex + 1;
          setPreviewIndex(newIndex);
          setPreviewImage(previewGroupImages[newIndex]);
        } else if (
          gestureState.dx > 40 &&
          previewGroupImages.length > 1 &&
          previewIndex > 0
        ) {
          const newIndex = previewIndex - 1;
          setPreviewIndex(newIndex);
          setPreviewImage(previewGroupImages[newIndex]);
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!previewVisible) {
      setPreviewIndex(0);
      setPreviewGroupImages([]);
      setPreviewImage(null);
    }
  }, [previewVisible]);

  // Generate date range for scroller
  useEffect(() => {
    const today = new Date();
    const dates: Date[] = [];
    for (let i = -14; i <= 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setDateRange(dates);
  }, []);

  // Scroll to selected date
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
  }, [dateRange, selectedDate, groups?.length]);

  // Fetch gallery groups
  const loadGroups = async () => {
    if (!sectionId) return;
    setLoading(true);
    try {
      const res = await fetchSectionGalleryGroups(
        sectionId as string,
        selectedDate || undefined
      );
      setGroups(res.files);
    } catch (e) {
      setGroups([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  // Calendar logic
  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();
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
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(normalizeDate(today));
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
      const hasEntries = groups.some(
        (group) => normalizeDate(group.createdat) === dateString
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

  // Date scroller
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
    const hasEntries = groups.some(
      (group) => normalizeDate(group.createdat) === normalizeDate(item)
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

  // Group gallery groups by date for SectionList
  const groupByDate = (groups: GalleryGroup[]) => {
    const grouped: { title: string; data: GalleryGroup[] }[] = [];
    const dateMap = new Map<string, GalleryGroup[]>();
    const sorted = [...groups].sort(
      (a, b) =>
        new Date(b.createdat).getTime() - new Date(a.createdat).getTime()
    );
    sorted.forEach((group) => {
      const date = formatDate(group.createdat);
      if (!dateMap.has(date)) dateMap.set(date, []);
      dateMap.get(date)?.push(group);
    });
    dateMap.forEach((data, title) => grouped.push({ title, data }));
    return grouped;
  };

  const filteredGroups = selectedDate
    ? groups.filter((g) => normalizeDate(g.createdat) === selectedDate)
    : groups;
  const groupedEntries = selectedDate ? [] : groupByDate(groups);

  // Custom alert state
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState("");
  const [customAlertMessage, setCustomAlertMessage] = useState("");
  const [customAlertType, setCustomAlertType] = useState<
    "info" | "warning" | "error" | "success"
  >("info");

  // Image preview handlers
  const openPreview = (uri: string, groupImages: string[]) => {
    const images = groupImages.length > 0 ? groupImages : [uri];
    setPreviewGroupImages(images);
    setPreviewIndex(images.indexOf(uri) >= 0 ? images.indexOf(uri) : 0);
    setPreviewImage(uri);
    setPreviewVisible(true);
  };

  const handleDownload = async (uri: string) => {
    try {
      const filename = uri.split("/").pop() || "image.jpg";
      const fileUri = FileSystem.cacheDirectory + filename;
      const downloadResumable = FileSystem.createDownloadResumable(
        uri,
        fileUri
      );
      const { uri: localUri } = await downloadResumable.downloadAsync();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      } else {
        setCustomAlertTitle("Downloaded");
        setCustomAlertMessage("Image downloaded to: " + localUri);
        setCustomAlertType("success");
        setCustomAlertVisible(true);
      }
    } catch (e) {
      setCustomAlertTitle("Download Failed");
      setCustomAlertMessage("Could not download image.");
      setCustomAlertType("error");
      setCustomAlertVisible(true);
    }
  };

  const handleSaveToDevice = async (uri: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setCustomAlertTitle("Permission Denied");
        setCustomAlertMessage("Cannot save image without media permissions.");
        setCustomAlertType("error");
        setCustomAlertVisible(true);
        return;
      }
      const filename = uri.split("/").pop() || "image.jpg";
      const fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.downloadAsync(uri, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      setCustomAlertTitle("Saved");
      setCustomAlertMessage("Image saved to your device gallery.");
      setCustomAlertType("success");
      setCustomAlertVisible(true);
    } catch (e) {
      setCustomAlertTitle("Save Failed");
      setCustomAlertMessage("Could not save image to device.");
      setCustomAlertType("error");
      setCustomAlertVisible(true);
    }
  };

  // Render gallery group card (no delete icon)
  const renderGroup = ({ item }: { item: GalleryGroup }) => (
    <View style={styles.entryCard}>
      <View style={styles.groupImagesWrapper}>
        <View style={styles.groupImagesRow}>
          {item.filenames.slice(0, 4).map((url, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => openPreview(url, item.filenames)}
            >
              <Image
                source={{ uri: url }}
                style={styles.groupImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
        {/* "+N" overlay */}
        {item.filenames.length > 4 && (
          <View style={styles.moreImagesOverlayTopRight}>
            <Text style={styles.moreImagesText}>
              +{item.filenames.length - 4}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.entryContent}>
        <Text style={styles.entryTitle} numberOfLines={1}>
          {item.description || "No description"}
        </Text>
      </View>
    </View>
  );

  // Section header for SectionList
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.dateHeaderContainer}>
      <Text style={styles.sectionDateHeader}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f7fa" }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Gallery</Text>
        </View>
        {/* Image Preview Modal */}
        <Modal
          visible={previewVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.95)",
              justifyContent: "center",
              alignItems: "center",
            }}
            {...panResponder.panHandlers}
          >
            {previewGroupImages.length > 0 && (
              <>
                <View
                  style={{
                    width: "100%",
                    height: "80%",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  {/* Left arrow */}
                  {previewGroupImages.length > 1 && previewIndex > 0 && (
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        left: 16,
                        zIndex: 2,
                        backgroundColor: "rgba(30,30,30,0.7)",
                        borderRadius: 24,
                        width: 48,
                        height: 48,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        const newIndex = Math.max(0, previewIndex - 1);
                        setPreviewIndex(newIndex);
                        setPreviewImage(previewGroupImages[newIndex]);
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name="chevron-left"
                        size={36}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  )}
                  <Image
                    source={{ uri: previewGroupImages[previewIndex] }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "contain",
                      borderRadius: 0,
                      marginBottom: 0,
                    }}
                  />
                  {/* Right arrow */}
                  {previewGroupImages.length > 1 &&
                    previewIndex < previewGroupImages.length - 1 && (
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          right: 16,
                          zIndex: 2,
                          backgroundColor: "rgba(30,30,30,0.7)",
                          borderRadius: 24,
                          width: 48,
                          height: 48,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() => {
                          const newIndex = Math.min(
                            previewGroupImages.length - 1,
                            previewIndex + 1
                          );
                          setPreviewIndex(newIndex);
                          setPreviewImage(previewGroupImages[newIndex]);
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={36}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    )}
                </View>
                {/* Image index indicator */}
                {previewGroupImages.length > 1 && (
                  <Text style={{ color: "#fff", marginTop: 8, fontSize: 15 }}>
                    {previewIndex + 1} / {previewGroupImages.length}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 18,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 24,
                      borderWidth: 1,
                      borderColor: "#eee",
                      marginRight: 12,
                    }}
                    onPress={() => setPreviewVisible(false)}
                  >
                    <Text style={{ color: "#333", fontWeight: "600" }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: primary,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 32,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                    onPress={() =>
                      handleSaveToDevice(previewGroupImages[previewIndex])
                    }
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      Save
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: "#eee",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() =>
                      handleDownload(previewGroupImages[previewIndex])
                    }
                  >
                    <MaterialCommunityIcons
                      name="share-variant"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primary} />
            </View>
          ) : filteredGroups.length > 0 ? (
            selectedDate ? (
              <FlatList
                data={filteredGroups}
                keyExtractor={(item) => item.groupid}
                renderItem={renderGroup}
                contentContainerStyle={styles.entriesList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            ) : (
              <SectionList
                sections={groupedEntries}
                keyExtractor={(item) => item.groupid}
                renderItem={renderGroup}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.entriesList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                stickySectionHeadersEnabled={false}
              />
            )
          ) : (
            <View style={styles.noEntriesContainer}>
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={50}
                color="#ddd"
              />
              <Text style={styles.noEntriesText}>
                {selectedDate
                  ? "No gallery groups for this date"
                  : "No gallery groups found"}
              </Text>
            </View>
          )}
        </View>
        {/* Custom Alert for download errors */}
        <CustomAlert
          visible={customAlertVisible}
          title={customAlertTitle}
          message={customAlertMessage}
          type={customAlertType}
          onConfirm={() => setCustomAlertVisible(false)}
          showCancelButton={false}
          cancelable
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  title: {
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
  groupImagesWrapper: {
    position: "relative",
    minHeight: 70,
    marginBottom: 8,
    width: 4 * 70 + 3 * 8 + 16,
    maxWidth: "100%",
    alignSelf: "flex-start",
  },
  groupImagesRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingRight: 40,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  groupImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  moreImagesOverlayTopRight: {
    position: "absolute",
    top: 40,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    minWidth: 36,
  },
  moreImagesText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  entryContent: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  entryTitle: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
    marginBottom: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
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
});

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";

type Props = {
  childId: string;
};

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
  room: string;
  color: string;
};

type DaySchedule = {
  day: Day;
  periods: Period[];
};

export default function ChildTimetable({ childId }: Props) {
  const [selectedDay, setSelectedDay] = useState<Day>("Monday");

  // Sample timetable data
  const timetableData: DaySchedule[] = [
    {
      day: "Monday",
      periods: [
        {
          id: "m1",
          subject: "Mathematics",
          teacher: "Mrs. Smith",
          time: "08:00 - 09:30",
          room: "Room 101",
          color: "#4CAF50",
        },
        {
          id: "m2",
          subject: "English",
          teacher: "Mr. Johnson",
          time: "09:45 - 11:15",
          room: "Room 103",
          color: "#2196F3",
        },
        {
          id: "m3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          room: "Cafeteria",
          color: "#9E9E9E",
        },
        {
          id: "m4",
          subject: "Science",
          teacher: "Mrs. Davis",
          time: "12:00 - 13:30",
          room: "Lab 2",
          color: "#9C27B0",
        },
        {
          id: "m5",
          subject: "Physical Education",
          teacher: "Mr. Thompson",
          time: "13:45 - 15:15",
          room: "Gymnasium",
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
          room: "Room 105",
          color: "#795548",
        },
        {
          id: "t2",
          subject: "Mathematics",
          teacher: "Mrs. Smith",
          time: "09:45 - 11:15",
          room: "Room 101",
          color: "#4CAF50",
        },
        {
          id: "t3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          room: "Cafeteria",
          color: "#9E9E9E",
        },
        {
          id: "t4",
          subject: "Art",
          teacher: "Ms. Garcia",
          time: "12:00 - 13:30",
          room: "Art Studio",
          color: "#FF5722",
        },
        {
          id: "t5",
          subject: "English",
          teacher: "Mr. Johnson",
          time: "13:45 - 15:15",
          room: "Room 103",
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
          room: "Lab 2",
          color: "#9C27B0",
        },
        {
          id: "w2",
          subject: "Music",
          teacher: "Mr. Martinez",
          time: "09:45 - 11:15",
          room: "Music Room",
          color: "#E91E63",
        },
        {
          id: "w3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          room: "Cafeteria",
          color: "#9E9E9E",
        },
        {
          id: "w4",
          subject: "Mathematics",
          teacher: "Mrs. Smith",
          time: "12:00 - 13:30",
          room: "Room 101",
          color: "#4CAF50",
        },
        {
          id: "w5",
          subject: "Computer Science",
          teacher: "Mr. Lee",
          time: "13:45 - 15:15",
          room: "Computer Lab",
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
          room: "Room 103",
          color: "#2196F3",
        },
        {
          id: "th2",
          subject: "Social Studies",
          teacher: "Mrs. Anderson",
          time: "09:45 - 11:15",
          room: "Room 106",
          color: "#607D8B",
        },
        {
          id: "th3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          room: "Cafeteria",
          color: "#9E9E9E",
        },
        {
          id: "th4",
          subject: "Science",
          teacher: "Mrs. Davis",
          time: "12:00 - 13:30",
          room: "Lab 2",
          color: "#9C27B0",
        },
        {
          id: "th5",
          subject: "Study Hall",
          teacher: "Ms. Taylor",
          time: "13:45 - 15:15",
          room: "Library",
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
          room: "Room 101",
          color: "#4CAF50",
        },
        {
          id: "f2",
          subject: "Language",
          teacher: "Ms. Rodriguez",
          time: "09:45 - 11:15",
          room: "Room 104",
          color: "#009688",
        },
        {
          id: "f3",
          subject: "Lunch Break",
          teacher: "",
          time: "11:15 - 12:00",
          room: "Cafeteria",
          color: "#9E9E9E",
        },
        {
          id: "f4",
          subject: "Health",
          teacher: "Mrs. White",
          time: "12:00 - 13:30",
          room: "Room 107",
          color: "#F44336",
        },
        {
          id: "f5",
          subject: "Club Activities",
          teacher: "Various",
          time: "13:45 - 15:15",
          room: "Various",
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
          room: "Room 101",
          color: "#4CAF50",
        },
        {
          id: "s2",
          subject: "Art Club",
          teacher: "Ms. Garcia",
          time: "10:45 - 12:15",
          room: "Art Studio",
          color: "#FF5722",
        },
      ],
    },
  ];

  const currentSchedule = timetableData.find(
    (item) => item.day === selectedDay
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>School Timetable</Text>
      </View>

      <View style={styles.daysOuterContainer}>
        <ScrollView
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
        {currentSchedule?.periods.map((period) => (
          <View key={period.id} style={styles.periodCard}>
            <View
              style={[styles.periodColor, { backgroundColor: period.color }]}
            />
            <View style={styles.periodTimeContainer}>
              <Text style={styles.periodTime}>{period.time}</Text>
            </View>
            <View style={styles.periodDetails}>
              <Text style={styles.periodSubject}>{period.subject}</Text>
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
              <Text style={styles.periodRoom}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color="#666"
                />{" "}
                {period.room}
              </Text>
            </View>
          </View>
        ))}
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
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  daysOuterContainer: {
    height: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "center",
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
  periodRoom: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
});

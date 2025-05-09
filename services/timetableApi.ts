import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the timetable API response structure based on the actual response
interface TimetableItem {
  id: number;
  sectionid: number;
  day: string;
  subject: string;
  topic: string;
  createdat: string;
  updatedat: string | null;
  deletedat: string | null;
  teacherid: number;
  firstname: string;
  lastname: string;
  start_time: string;
  end_time: string;
}

// Define a type for the cleaned timetable entry
export interface TimetableEntry {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  color: string;
  topic?: string;
  startTime: string;
  endTime: string;
}

// Define the request body for creating a timetable entry
export interface TimetableEntryCreateRequest {
  section_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  description: string;
  user_id?: number; // Optional as we'll get it from stored user data if not provided
}

// Subject color mapping
const subjectColors: Record<string, string> = {
  Mathematics: "#4CAF50",
  English: "#2196F3",
  Science: "#9C27B0",
  "Physical Education": "#FF9800",
  History: "#795548",
  Art: "#FF5722",
  Music: "#E91E63",
  Geography: "#607D8B",
  Telugu: "#3F51B5",
};

// Get a color for a subject, creating one if needed
const getSubjectColor = (subject: string): string => {
  if (!subjectColors[subject]) {
    // Generate a color based on subject name if not in our mapping
    const colors = [
      "#4CAF50",
      "#2196F3",
      "#9C27B0",
      "#FF9800",
      "#795548",
      "#FF5722",
      "#E91E63",
      "#00BCD4",
      "#607D8B",
      "#3F51B5",
      "#009688",
      "#F44336",
      "#CDDC39",
    ];
    const index = Object.keys(subjectColors).length % colors.length;
    subjectColors[subject] = colors[index];
  }
  return subjectColors[subject];
};

/**
 * Fetch section timetable for a specific day
 * @param sectionId - The ID of the section to fetch timetable for
 * @param dayOfWeek - The day of the week (Monday, Tuesday, etc.)
 * @returns The timetable entries for the specified section and day
 */
export const fetchSectionTimetable = async (
  sectionId: string,
  dayOfWeek: string
): Promise<TimetableEntry[]> => {
  try {
    console.log(`Fetching timetable for section ${sectionId} on ${dayOfWeek}`);

    const response = await api.get<TimetableItem[]>("/section/timetable", {
      params: {
        section_id: sectionId,
        day_of_week: dayOfWeek,
      },
    });

    // Debug the API response
    console.log("API Response:", response.data);

    // Transform API response to match our component's expected format
    if (Array.isArray(response.data)) {
      return response.data.map((item) => ({
        id: item.id.toString(),
        subject: item.subject,
        teacher: `${item.firstname} ${item.lastname}`.trim(),
        time: `${item.start_time} - ${item.end_time}`,
        color: getSubjectColor(item.subject),
        topic: item.topic,
        startTime: item.start_time,
        endTime: item.end_time,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching section timetable:", error);
    throw error;
  }
};

/**
 * Create a new timetable entry
 * @param entry - The timetable entry data to create
 * @returns The created timetable entry
 */
export const createTimetableEntry = async (
  entry: TimetableEntryCreateRequest
): Promise<any> => {
  try {
    // Get the user ID from stored user data if not provided
    if (!entry.user_id) {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) {
          entry.user_id = user.id;
        }
      }
    }

    console.log("Creating timetable entry with data:", entry);

    const response = await api.post("/timetable/create", entry);
    return response.data;
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    throw error;
  }
};

/**
 * Update an existing timetable entry
 * @param entryId - The ID of the timetable entry to update
 * @param entry - The updated timetable entry data
 * @returns The updated timetable entry
 */
export const updateTimetableEntry = async (
  entryId: string,
  entry: TimetableEntryCreateRequest
): Promise<any> => {
  try {
    // Get the user ID from stored user data if not provided
    if (!entry.user_id) {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) {
          entry.user_id = user.id;
        }
      }
    }

    console.log(`Updating timetable entry ${entryId} with data:`, entry);

    const response = await api.put(`/timetable/update`, entry, {
      params: {
        timetable_id: entryId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    throw error;
  }
};

/**
 * Delete a timetable entry
 * @param entryId - The ID of the timetable entry to delete
 * @returns The result of the deletion
 */
export const deleteTimetableEntry = async (entryId: string): Promise<any> => {
  try {
    console.log(`Deleting timetable entry ${entryId}`);

    const response = await api.delete(`/timetable/delete`, {
      params: {
        timetable_id: entryId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    throw error;
  }
};

/**
 * Get the current day of the week
 * @returns The current day name (e.g., "Monday")
 */
export const getCurrentDayOfWeek = (): string => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayIndex = new Date().getDay();
  return daysOfWeek[dayIndex];
};

import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the diary API response structure based on the actual response
interface DiaryAPIResponse {
  page: number;
  per_page: number;
  items: Array<{
    id: number;
    sectionid: number; // lowercase in API
    notetype: string; // This is different from our expected "title"
    effectivedate: string; // lowercase in API
    subject: string; // New field
    description: string; // This is our "content"
    duedate: string | null; // New field
    createdat: string; // lowercase in API
    updatedat: string | null; // lowercase in API
    deletedat: string | null; // lowercase in API
    isurgent: boolean; // New field
  }>;
}

// Define the shape of the diary data
export type DiaryEntries = DiaryAPIResponse;

export interface DiaryEntryCreateRequest {
  sectionid: number;
  noteType: string;
  effectiveDate: string;
  dueDate: string;
  subject: string;
  description: string;
  createdBy?: number; // Optional now as we'll get it automatically
  isUrgent?: boolean; // Add the isUrgent flag
}

export interface DiaryEntryUpdateRequest extends DiaryEntryCreateRequest {
  // Same as create request, potentially with an ID if needed in the body
}

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD format
};

/**
 * Fetch section diary entries
 * @param sectionId - The ID of the section to fetch diary entries for
 * @param effectiveDate - The effective date for the diary entries (YYYY-MM-DD format)
 * @returns The diary entries data
 */
export const fetchSectionDiaryEntries = async (
  sectionId: string,
  effectiveDate: string = getTodayDate()
): Promise<DiaryEntries> => {
  try {
    const response = await api.get<DiaryAPIResponse>("/diary/list", {
      params: {
        sectionid: sectionId,
        effectiveDate,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    throw error;
  }
};

/**
 * Create a new diary entry
 */
export const createDiaryEntry = async (
  entry: DiaryEntryCreateRequest
): Promise<any> => {
  try {
    // Get the user ID from stored user data
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.id) {
        entry.createdBy = user.id; // Set the user ID as createdBy
      }
    }

    const response = await api.post("/diary/create", entry);
    return response.data;
  } catch (error) {
    console.error("Error creating diary entry:", error);
    throw error;
  }
};

/**
 * Update an existing diary entry
 */
export const updateDiaryEntry = async (
  diaryId: string,
  entry: DiaryEntryUpdateRequest
): Promise<any> => {
  try {
    // Get the user ID from stored user data
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.id) {
        entry.createdBy = user.id; // Set the user ID as createdBy
      }
    }

    const response = await api.put("/diary/update", entry, {
      params: {
        diary_id: diaryId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating diary entry:", error);
    throw error;
  }
};

/**
 * Delete a diary entry
 */
export const deleteDiaryEntry = async (diaryId: string): Promise<any> => {
  try {
    const response = await api.delete("/diary/delete", {
      params: {
        diary_id: diaryId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    throw error;
  }
};

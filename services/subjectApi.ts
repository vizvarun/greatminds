import api from "./api";

export interface Subject {
  id: string;
  name: string;
}

/**
 * Fetches the list of subjects for a given school and user
 * @param schoolId - The school ID
 * @param userId - The user ID
 * @returns A promise that resolves to an array of subjects
 */
export async function fetchSubjects(
  schoolId: string,
  userId: string
): Promise<Subject[]> {
  try {
    console.log(`Fetching subjects for school: ${schoolId}, user: ${userId}`);
    const response = await api.get(
      `/subject/list?school_id=${schoolId}&user_id=${userId}`
    );

    console.log("Subject API response:", JSON.stringify(response, null, 2));

    // Handle the response.data format (common API response structure)
    if (response?.data) {
      console.log("Using response.data");
      const data = response.data;

      // Check if data has a subjects array
      if (data.subjects && Array.isArray(data.subjects)) {
        console.log("Found subjects array in data");
        return data.subjects.map((subject: any) => ({
          id: (subject.id || subject.subjectId || "").toString(),
          name: subject.subjectName || subject.name || "Unknown Subject",
        }));
      }

      // If data itself is an array
      if (Array.isArray(data)) {
        console.log("Data is an array");
        return data.map((subject: any) => ({
          id: (subject.id || subject.subjectId || "").toString(),
          name: subject.subjectName || subject.name || "Unknown Subject",
        }));
      }
    }

    // Handle the paginated response format with nested subjects array
    if (response && response.subjects && Array.isArray(response.subjects)) {
      console.log("Found subjects array in response root");
      return response.subjects.map((subject: any) => ({
        id: (subject.id || subject.subjectId || "").toString(),
        name: subject.subjectName || subject.name || "Unknown Subject",
      }));
    }

    // Handle direct array response format
    if (Array.isArray(response)) {
      console.log("Response is an array");
      return response.map((subject: any) => ({
        id: (subject.id || subject.subjectId || "").toString(),
        name: subject.subjectName || subject.name || "Unknown Subject",
      }));
    }

    console.warn("No recognized subject data format found in response");
    return [];
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
}

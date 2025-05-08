import api from "./api";

// Define the actual API response structure
interface AttendanceAPIResponse {
  summary: {
    total_students: number;
    present_count: number;
    absent_count: number;
    leave_count: number;
    untracked_count: number;
    present_percentage: number;
    absent_percentage: number;
    leave_percentage: number;
    untracked_percentage: number;
  };
  details: Array<{
    id: number;
    sectionid: number;
    studentid: number;
    attendance: string;
    remarks: string;
    date: string;
    createdat: string;
    updatedat: string | null;
    deletedat: string | null;
  }>;
}

// Define the shape of the attendance data
export type AttendanceSummary = AttendanceAPIResponse & {
  section_id: string;
  date: string;
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD format
};

/**
 * Fetch section attendance summary
 * @param section_id - The ID of the section to fetch attendance for
 * @returns The attendance summary data
 */
export const fetchSectionAttendanceSummary = async (
  section_id: string
): Promise<AttendanceSummary> => {
  try {
    const response = await api.get<AttendanceAPIResponse>(
      "/section/attendance/summary",
      {
        params: {
          section_id,
          date: getTodayDate(),
        },
      }
    );

    // Return the complete API response along with the section_id and date
    return {
      ...response.data,
      section_id: section_id,
      date: getTodayDate(),
    };
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    throw error;
  }
};

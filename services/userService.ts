import api from "./api";
import { StudentProfileResponse, StudentProfile } from "@/types/api";

// Fetch user profile by user ID
export const getUserProfile = async (userId: number) => {
  const response = await api.get(`/user/profile`, {
    params: {
      user_id: userId,
    },
  });
  return response.data;
};

// Fetch student profile by user ID and student ID
export const getStudentProfile = async (
  userId: number,
  studentId: number
): Promise<StudentProfile> => {
  const response = await api.get(`/students/profile`, {
    params: {
      user_id: userId,
      student_id: studentId,
    },
  });

  // Add the student ID to the response data
  return {
    ...response.data,
    id: studentId,
  };
};

// Fetch profiles for multiple students
export const getStudentProfiles = async (
  userId: number,
  studentIds: number[]
): Promise<StudentProfile[]> => {
  try {
    if (!studentIds || studentIds.length === 0) {
      return [];
    }

    // Use Promise.all to fetch multiple student profiles in parallel
    const profilePromises = studentIds.map((studentId) =>
      getStudentProfile(userId, studentId).catch((error) => {
        console.error(
          `Error fetching profile for student ${studentId}:`,
          error
        );
        // Return a null value that can be filtered out
        return null;
      })
    );

    const profiles = await Promise.all(profilePromises);
    // Filter out any null profiles from failed requests
    return profiles.filter((profile) => profile !== null);
  } catch (error) {
    console.error("Error fetching student profiles:", error, error?.response);
    throw error;
  }
};

// Fetch detailed student information for parent dashboard
export default {
  getUserProfile,
  getStudentProfile,
  getStudentProfiles,
};

import api from "./api";

// Define the types for teacher API responses
export interface Teacher {
  id: number;
  sectionid: number;
  teacherid: number;
  typeid: number;
  createdat: string;
  updatedat: string | null;
  deletedat: string | null;
  firstname: string;
  lastname: string;
}

export interface SectionTeachersResponse {
  page: number;
  per_page: number;
  totalrecords: number;
  teachers: Teacher[];
}

/**
 * Fetch teachers assigned to a specific section
 * @param sectionId - The ID of the section
 * @returns Array of teachers assigned to the section
 */
export const fetchSectionTeachers = async (
  sectionId: string | number
): Promise<Teacher[]> => {
  try {
    const response = await api.get<SectionTeachersResponse>(
      "/section/teachers",
      {
        params: {
          section_id: sectionId,
        },
      }
    );

    return response.data.teachers;
  } catch (error) {
    console.error("Error fetching section teachers:", error);
    throw error;
  }
};

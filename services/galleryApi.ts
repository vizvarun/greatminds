import api from "./api";

export interface GalleryGroup {
  id: number;
  sectionid: number;
  userid: number;
  groupid: string;
  filenames: string[];
  createdat: string;
  updatedat: string | null;
  description: string | null;
}

export interface GalleryGroupsResponse {
  message: string;
  count: number;
  page: number;
  page_size: number;
  files: GalleryGroup[];
}

/**
 * Fetch gallery groups for a section, optionally filtered by date (YYYY-MM-DD)
 */
export const fetchSectionGalleryGroups = async (
  sectionId: string | number,
  date?: string
): Promise<GalleryGroupsResponse> => {
  const params: Record<string, any> = { section_id: sectionId };
  if (date) params.date = date;
  const response = await api.get<GalleryGroupsResponse>("/files/section", {
    params,
  });
  return response.data;
};

/**
 * Delete a gallery group by groupid
 */
export const deleteGalleryGroup = async (groupId: string) => {
  await api.delete(`/files/group/?group_id=${groupId}`);
};

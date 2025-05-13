/**
 * Extracts the section ID from a section detail object, handling different field naming conventions
 */
export const getSectionId = (sectionDetail: any): string => {
  if (!sectionDetail) return "";

  // Try different possible field names for section ID
  // Return the first one that exists
  return (
    sectionDetail.sectionid?.toString() ||
    sectionDetail.section_id?.toString() ||
    sectionDetail.id?.toString() ||
    ""
  );
};

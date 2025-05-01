import api from "./api";

// Fetch user profile by user ID
export const getUserProfile = async (userId: number) => {
  const response = await api.get(`/user/profile`, {
    params: {
      user_id: userId,
    },
  });
  return response.data;
};

export default {
  getUserProfile,
};

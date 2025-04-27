import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const loginWithGoogle = async (idToken) => {
  const response = await axios.post(`${API_URL}/auth/google`, { idToken });
  return response.data;
};

import axios from "axios";
export const jwtAxios = axios.create();
axios.defaults.withCredentials = true;
const login = async (data) => {
  const res = await axios.post("http://localhost:3000/users/sign-in", data);
  return res.data;
};

const register = async (userData) => {
  console.log("toi register", userData);
  const res = await axios.post("http://localhost:3000/users/sign-up", userData);
  return res.data;
};

const refresh_token = async () => {
  const res = await axios.post("http://localhost:3000/users/refresh-token", {
    withCredentials: true,
  });
  console.log("res", res);
  return res.data;
};

const getDetails = async (id, access_token) => {
  const res = await jwtAxios.get(`http://localhost:3000/users/details/${id}`, {
    headers: {
      access_token: access_token,
    },
  });
  return res.data;
};

const logout = async () => {
  const res = await axios.get("http://localhost:3000/users/sign-out");
  return res.data;
};

const getAllUsers = async (filter) => {
  const res = await axios.get("http://localhost:3003/users/get-all", {
    params: filter,
  });
  return res.data;
};

const updateUser = async (id, data) => {
  const res = await jwtAxios.put(
    `http://localhost:3000/users/update/${id}`,
    data
  );
  return res.data;
};

const UserServices = {
  login,
  register,
  getDetails,
  refresh_token,
  jwtAxios,
  logout,
  getAllUsers,
  updateUser,
};

export default UserServices;

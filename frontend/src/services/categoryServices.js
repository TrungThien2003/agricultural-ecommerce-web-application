import axios from "axios";
import { jwtAxios } from "./userServices";
// DUng axios cua thang get detail users neu no het han no se goi UserServices.jwtAxios.interceptors.request.

const getCategories = async (filter) => {
  const res = await axios.get("http://localhost:3000/categories", {
    params: filter,
  });
  return res.data;
};

const create = async (data) => {
  const res = await axios.post("http://localhost:3000/categories", data);
  return res.data;
};

const update = async (id, data, access_token) => {
  const res = await jwtAxios.put(
    `http://localhost:3000/categories/${id}`,
    data,
    { headers: { access_token } }
  );
  return res.data;
};

const categoryServices = {
  getCategories,
  create,
  update,
};

export default categoryServices;

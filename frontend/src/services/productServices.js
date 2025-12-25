import axios from "axios";

const fetchProduct = async (filter) => {
  const res = await axios.get("http://localhost:3000/products/get-all", {
    params: filter,
  });
  return res.data;
};

const create = async (data) => {
  const res = await axios.post("http://localhost:3000/products/create", data);
  return res;
};

const getDetails = async (id) => {
  const res = await axios.get(`http://localhost:3000/products/details/${id}`);
  return res.data;
};

const updateProduct = async (id, data) => {
  const res = await axios.put(
    `http://localhost:3000/products/update/${id}`,
    data
  );
  return res.data;
};

const productServices = {
  fetchProduct,
  create,
  getDetails,
  updateProduct,
};
export default productServices;

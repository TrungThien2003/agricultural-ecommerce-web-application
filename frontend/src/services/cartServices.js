import axios from "axios";
import { get } from "react-hook-form";

const getCart = async (id) => {
  console.log("data.id", id);
  const res = await axios.get(`http://localhost:3000/cart/${id}`);
  return res;
};
const createCart = async (id) => {
  const res = await axios.post(`http://localhost:3000/cart/${id}`);
  return res;
};

const updateCart = async (data) => {
  const res = await axios.put(`http://localhost:3000/cart/${data.userId}`, {
    userId: data.userId,
    items: data.items,
  });
  return res;
};

const cartServices = { createCart, getCart, updateCart };

export default cartServices;

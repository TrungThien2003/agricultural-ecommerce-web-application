import axios from "axios";

const createOrder = async (data) => {
  const res = await axios.post("http://localhost:3000/order", data);
  return res;
};

const getOrders = async (userId) => {
  const res = await axios.get(`http://localhost:3000/order/${userId}`);
  return res;
};

const deleteOrder = async (id) => {
  const res = await axios.delete(`http://localhost:3000/order/${id}`);
  return res;
};

const getMoney = async (data) => {
  const res = await axios.post("http://localhost:3000/order/daily", data);
  return res;
};
const orderServices = { createOrder, getOrders, deleteOrder, getMoney };

export default orderServices;

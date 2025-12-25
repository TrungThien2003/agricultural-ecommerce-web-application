// const axios = require('axios')
import axios from "axios";

const zaloPayment = async (data) => {
  const result = await axios.post(
    "http://localhost:3000/payment/zalo-payment",
    data
  );
  console.log("data tu payment:", result);
  return result;
};

const zaloPaymentServices = { zaloPayment };

export default zaloPaymentServices;

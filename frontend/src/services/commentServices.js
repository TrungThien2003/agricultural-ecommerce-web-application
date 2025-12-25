import axios from "axios";

const getComments = async (data) => {
  const res = await axios.get("http://localhost:3000/comment", {
    params: data,
  });
  return res;
};

const createComment = async (data) => {
  try {
    const res = await axios.post("http://localhost:3000/comment", data);
    console.log("res", res);
    return res;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return error.response.data; // Return the entire error response object
    } else {
      console.error("Lỗi tạo bình luận:", error);
      throw error; // Re-throw other errors
    }
  }
};

const commentServices = { getComments, createComment };
export default commentServices;

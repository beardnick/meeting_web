import axios from "axios"; // 引入axios

const service = axios.create({
  baseURL: "http://127.0.0.1:9020",
  timeout: 1000
});

export default service

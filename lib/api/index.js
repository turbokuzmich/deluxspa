import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:1337/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `bearer ${process.env.API_TOKEN}`,
  },
});

export default instance;

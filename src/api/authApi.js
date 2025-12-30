import API from "./api";

export const loginUser = async (payload) => {
  return API.post("/user/signin", payload);
};

export const getUserStatus = async () => {
  return API.get("/user/status");
};

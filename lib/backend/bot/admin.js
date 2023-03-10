import axios from "axios";
import { sign } from "../../helpers/bot";
import isNil from "lodash/isNil";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

async function getToken(id) {
  const data = sign({ user: { id } });

  const {
    data: { token },
  } = await api.post("/admin/auth", {
    data,
  });

  return token;
}

export async function getFeedback(id, key) {
  try {
    const token = await getToken(id);

    const { data } = await api.get("/admin/feedback", {
      params: {
        key,
        token,
      },
    });

    return {
      status: "success",
      feedback: Object.keys(data)
        .filter((key) => !isNil(data[key]))
        .reduce((feedback, key) => ({ ...feedback, [key]: data[key] }), {}),
    };
  } catch (_) {
    return { status: "error" };
  }
}

export async function sendFeedbackResponse(id, key, response) {
  try {
    const token = await getToken(id);

    const { data } = await api.post(
      "/admin/feedback",
      {
        key,
        response,
      },
      {
        params: {
          token,
        },
      }
    );

    return {
      status: "success",
      feedback: Object.keys(data)
        .filter((key) => !isNil(data[key]))
        .reduce((feedback, key) => ({ ...feedback, [key]: data[key] }), {}),
    };
  } catch (_) {
    return { status: "error" };
  }
}

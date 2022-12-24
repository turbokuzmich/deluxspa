const axios = require("axios");

export const api = axios.create({
  baseURL: "https://api.boxberry.ru/json.php",
});

export async function listCities() {
  const { data } = await api.get("", {
    params: {
      token: process.env.BOXBERRY_TOKEN,
      method: "ListCities",
      ContryCode: "643",
    },
  });

  return data.filter(({ CountryCode }) => CountryCode === "643");
}

export async function listPoints() {
  const { data } = await api.get("", {
    params: {
      token: process.env.BOXBERRY_TOKEN,
      method: "ListPoints",
      ContryCode: "643",
    },
  });

  return data;
}

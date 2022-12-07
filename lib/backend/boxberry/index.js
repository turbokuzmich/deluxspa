const axios = require("axios");

export const api = axios.create({
  baseURL: "https://api.boxberry.ru/json.php",
});

export async function listPoints() {
  try {
    const result = await api.get("", {
      params: {
        token: process.env.BOXBERRY_TOKEN,
        method: "ListPoints",
        ContryCode: "643",
      },
    });
    console.log(result);
  } catch (error) {
    // FIXME ваша учетная запись заблокирована
    console.log(error);
  }
}

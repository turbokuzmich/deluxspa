const url = require("url");
const get = require("lodash/get");
const axios = require("axios");

let token = null;

export const api = axios.create({
  baseURL: "https://api.edu.cdek.ru/v2",
});

// FIXME этот метод не является потокобезопасным
// могут произойти race conditions, т.к.
// может существовать только лишь один токен
async function fetchToken() {
  const params = new url.URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CDEK_CLIENT_ID,
    client_secret: process.env.CDEK_CLIENT_SECRET,
  });

  delete api.defaults.headers.common.Authorization;

  const { data } = await api.post(
    "/oauth/token?parameters",
    params.toString(),
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }
  );

  api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

  token = data;
}

function ensureAuthorized(method) {
  return async function (data) {
    if (!token) {
      await fetchToken();
    }

    try {
      return await method(data);
    } catch (error) {
      if (get(error, "response.status", 0) === 401) {
        await fetchToken();
        return await method(data);
      }
    }
  };
}

export const calculate = ensureAuthorized(async function calculate({
  address,
  coordinates,
  type,
}) {
  const { data } = await api.post("/calculator/tariff", {
    tariff_code: type === "home" ? 137 : 136,
    from_location: {
      // FIXME перенести этот адрес в конфиг
      // или, может, можно из сдека подтягивать как-то
      latitude: 55.615141,
      longitude: 37.398198,
      address:
        "Центральная улица, 48А, деревня Картмазово, поселение Московский, Москва",
    },
    to_location: {
      ...coordinates,
      address,
    },
    services: [
      {
        code: "CARTON_BOX_XS",
        parameter: "2",
      },
    ],
    packages: [
      {
        height: 10,
        length: 10,
        weight: 4000,
        width: 10,
      },
    ],
  });

  return data;
});

// FIXME это бы кешировать стоит на каое-то время
export const deliveryPoints = ensureAuthorized(async function deliveryPoints() {
  const { data } = await api.get("/deliverypoints");

  return data;
});

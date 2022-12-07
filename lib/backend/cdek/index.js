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
      // FIXME возможно, тут должен быть адрес отделения
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

export const regions = ensureAuthorized(async function regions(page = 0) {
  const { data } = await api.get("/location/regions", {
    params: {
      page,
      size: 500,
      country_codes: "ru",
    },
  });

  return data;
});

// {
//   code: 1127320,
//   city: 'Агрокультура',
//   fias_guid: '91dda508-b70d-48e4-96da-1db724510921',
//   country_code: 'RU',
//   country: 'Россия',
//   region: 'Рязанская область',
//   region_code: 41,
//   longitude: 41.213684,
//   latitude: 54.205955,
//   time_zone: 'Europe/Moscow',
//   payment_limit: 0
// },
export const cities = ensureAuthorized(async function cities(page = 0) {
  const { data } = await api.get("/location/cities", {
    params: {
      page,
      size: 500,
      country_codes: "ru",
    },
  });

  return data;
});

// FIXME это бы кешировать стоит на каое-то время
export const deliveryPoints = ensureAuthorized(async function deliveryPoints() {
  const { data } = await api.get("/deliverypoints", {
    params: {
      country_code: "ru",
    },
  });

  return data.map(
    ({
      code,
      location: { latitude, longitude, address_full, city_code },
      email,
      site,
      // phones,
      name,
      work_time,
      address_comment,
    }) => ({
      name,
      externalId: code,
      type: "cdek",
      email,
      site,
      // phones,
      latitude,
      longitude,
      workingTime: work_time,
      address: address_full,
      addressComment: address_comment,
      city: city_code,
    })
  );
});

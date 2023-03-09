import url from "url";
import get from "lodash/get";
import property from "lodash/property";
import axios from "axios";
import { City, Point } from "./sequelize";

let tokenStatus = "initial"; // 'fetching' | 'set'
let tokenPromises = [];

export const api = axios.create({
  baseURL: process.env.CDEK_API_URL,
});

async function maybeSetToken(reset = false) {
  if (tokenStatus === "set" && reset === false) {
    return Promise.resolve();
  }

  if (tokenStatus === "fetching") {
    return new Promise((resolve) => {
      tokenPromises.push(resolve);
    });
  }

  tokenStatus = "fetching";

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

  tokenStatus = "set";

  tokenPromises.forEach((resolve) => resolve());
  tokenPromises = [];
}

function ensureAuthorized(method) {
  return async function (data) {
    await maybeSetToken();

    try {
      return await method(data);
    } catch (error) {
      if (get(error, "response.status", 0) === 401) {
        await maybeSetToken(true);
        return await method(data);
      }
    }
  };
}

export const calculate = ensureAuthorized(async function calculate(
  code,
  address
) {
  const { data } = await api.post("/calculator/tariff", {
    tariff_code: 366,
    from_location: {
      code: process.env.CDEK_CODE,
      latitude: process.env.CDEK_LAT,
      longitude: process.env.CDEK_LNG,
      address: process.env.CDEK_ADDRESS,
    },
    to_location: {
      address,
      code,
    },
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

export const cities = ensureAuthorized(async function cities(page = 0) {
  const { data } = await api.get("/location/cities", {
    params: {
      page,
      size: 5000,
      country_codes: "ru",
    },
  });

  return data;
});

export const points = ensureAuthorized(async function deliveryPoints(
  city = null
) {
  const commonParams = {
    country_code: "ru",
  };

  const { data } = await api.get("/deliverypoints", {
    params: city ? { ...commonParams, city_code: city } : commonParams,
  });

  return data;
});

export async function updateAll() {
  await City.update(
    { confirmed: false },
    { where: { confirmed: true, count: 0 } }
  );
  await Point.update({ confirmed: false }, { where: { confirmed: true } });

  for (let page = 0; ; page++) {
    const fetchedCities = await cities(page);

    if (fetchedCities.length === 0) {
      break;
    }

    const fetchedCodes = fetchedCities.map(property("code"));

    const existingCodes = (
      await City.findAll({
        attributes: ["code"],
        where: {
          code: fetchedCodes,
        },
      })
    )
      .map(property("code"))
      .reduce((codes, code) => codes.add(code), new Set());

    await City.bulkCreate(
      fetchedCities
        .filter(({ code }) => !existingCodes.has(code))
        .map(({ code, city, country, region, longitude, latitude }) => ({
          code,
          city: city.toLowerCase(),
          country: country ? country.toLowerCase() : null,
          region: region ? region.toLowerCase() : null,
          longitude,
          latitude,
          confirmed: true,
        }))
    );

    await City.update(
      { confirmed: true },
      {
        where: {
          code: Array.from(existingCodes),
        },
      }
    );
  }

  const fetchedPoints = await points();

  const { cityCodes, cityCount } = fetchedPoints.reduce(
    (data, { location: { city_code } }) => {
      data.cityCodes.add(city_code);

      if (!data.cityCount.has(city_code)) {
        data.cityCount.set(city_code, 0);
      }

      data.cityCount.set(city_code, data.cityCount.get(city_code) + 1);

      return data;
    },
    { cityCodes: new Set(), cityCount: new Map() }
  );

  const ids = (
    await City.findAll({
      attributes: ["id", "code"],
      where: {
        code: Array.from(cityCodes),
      },
    })
  ).reduce((ids, { id, code }) => ({ ...ids, [code]: id }), {});

  const existingPointCodes = (
    await Point.findAll({
      attributes: ["code"],
      where: {
        code: fetchedPoints.map(property("code")),
      },
    })
  )
    .map(property("code"))
    .reduce((codes, code) => codes.add(code), new Set());

  for (const point of fetchedPoints) {
    if (existingPointCodes.has(point.code)) {
      continue;
    }

    const {
      code,
      name,
      location: {
        region_code,
        region,
        city_code,
        city,
        latitude,
        longitude,
        address_full,
      },
    } = point;

    try {
      await Point.create({
        code,
        name,
        info: JSON.stringify(point),
        regionCode: region_code,
        regionName: region,
        cityCode: city_code,
        cityName: city,
        address: address_full,
        latitude,
        longitude,
        confirmed: true,
        CityId: ids[city_code],
      });
    } catch (error) {
      console.log(point);
      console.log(error);
    }
  }

  await Point.update(
    { confirmed: true },
    {
      where: {
        code: Array.from(existingPointCodes),
      },
    }
  );

  for (const [code, count] of Array.from(cityCount.entries())) {
    await City.update({ count: count }, { where: { code } });
  }
}

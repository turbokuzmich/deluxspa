// import { Point } from "../../../../lib/backend/sequelize";
import get from "lodash/get";

export default async function points(req, res) {
  const city = get(req, "query.city", null);

  if (city === null) {
    return res.status(200).json([]);
  }

  const url = new URL(`${process.env.CDEK_SERVICE_URL}/points/by-city`);
  url.searchParams.set("city", city);

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "content-type": "application/json",
    },
    keepalive: false,
  });

  if (response.status === 200) {
    const cities = await response.json();

    return res.status(200).json(
      cities.map((point) => ({
        code: point.code,
        name: `${point.code}, ${point.address}`,
        location: {
          city_code: point.city_code,
          address_full: point.address_full,
          longitude: point.longitude,
          latitude: point.latitude,
        },
      }))
    );
  }

  return res.status(200).json([]);

  // const points = await Point.findAll({
  //   where: {
  //     cityCode: city,
  //     confirmed: true,
  //   },
  // });

  // res.status(200).json(points.map((point) => point.mapData));
}

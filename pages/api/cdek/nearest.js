// import { City } from "../../../lib/backend/sequelize";
import get from "lodash/get";

export default async function getNearestCity(req, res) {
  const lat = get(req, ["query", "lat"], 0);
  const lng = get(req, ["query", "lng"], 0);

  const url = new URL(`${process.env.CDEK_SERVICE_URL}/cities/nearest`);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lng", lng);

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "content-type": "application/json",
    },
    keepalive: false,
  });

  if (response.status === 200) {
    return res.status(200).json(await response.json());
  }

  return res.status(404).json({});

  // const nearest = await City.getNearestCity(lat, lng);

  // if (nearest) {
  //   return res.status(200).json(nearest.mapData);
  // } else {
  //   return res.status(404).json({});
  // }
}

import { City } from "../../../lib/backend/sequelize";
import get from "lodash/get";

export default async function getNearestCity(req, res) {
  const lat = get(req, ["query", "lat"], 0);
  const lng = get(req, ["query", "lng"], 0);

  const nearest = await City.getNearestCity(lat, lng);

  if (nearest) {
    return res.status(200).json(nearest.mapData);
  } else {
    return res.status(404).json({});
  }
}

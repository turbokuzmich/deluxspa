import { points as fetchPoints } from "../../../lib/backend/cdek";
import get from "lodash/get";

export default async function points(req, res) {
  const city = get(req, "query.city", null);

  if (city === null) {
    return res.status(200).json([]);
  }

  res.status(200).json(await fetchPoints(city));
}

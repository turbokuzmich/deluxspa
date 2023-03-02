import get from "lodash/get";
import { getCdekCities } from "../../../lib/backend/api";

export default async function cities(req, res) {
  const title = get(req, "query.title", "").trim();

  res.status(200).json(await getCdekCities(title));
}

import { Point } from "../../../lib/backend/sequelize";
import get from "lodash/get";
import omit from "lodash/omit";

export default async function points(req, res) {
  const city = get(req, "query.city", null);

  if (city === null) {
    return res.status(200).json([]);
  }

  const points = await Point.findAll({
    where: {
      cityCode: city,
      confirmed: true,
    },
  });

  res.status(200).json(points.map((point) => point.mapData));
}

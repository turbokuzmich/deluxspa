import get from "lodash/get";
import { Point } from "../../../../../lib/backend/sequelize";

export default async function pointByCode(req, res) {
  const code = get(req, ["query", "code"], "");
  const point = await Point.findOne({
    where: {
      code,
    },
  });

  if (point) {
    return res.status(200).json(JSON.parse(point.info));
  } else {
    return res.status(404).json({});
  }
}

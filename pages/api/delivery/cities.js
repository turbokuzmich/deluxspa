import { Op } from "sequelize";
import sequelize from "../../../lib/backend/sequelize";
import fPick from "lodash/fp/pick";

export default async function cities(req, res) {
  const {
    query: { city = "" },
  } = req;

  const found = await sequelize.models.City.findAll({
    raw: true,
    limit: 20,
    where: {
      name_lo: {
        [Op.like]: `%${city.toLowerCase()}%`,
      },
    },
  });

  res
    .status(200)
    .json(found.map(fPick(["id", "name", "region", "latitude", "longitude"])));
}

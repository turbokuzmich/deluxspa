import { Op } from "sequelize";
import { City } from "../../../lib/backend/sequelize";
import get from "lodash/get";

export default async function cities(req, res) {
  const title = get(req, "query.title", "").trim();

  const suggestions = await City.findAll({
    where: {
      [Op.or]: [
        { city: { [Op.like]: `%${title}%` } },
        { region: { [Op.like]: `%${title}%` } },
      ],
      count: {
        [Op.gt]: 0,
      },
      confirmed: true,
    },
    limit: 10,
    order: [["count", "DESC"]],
  });

  return res.status(200).json(suggestions.map((city) => city.mapData));
}

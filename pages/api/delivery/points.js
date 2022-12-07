import { Op } from "sequelize";
import { clientPostamatList as pickpointPoints } from "../../../lib/backend/pickpoint";
import { deliveryPoints as cdekPoints } from "../../../lib/backend/cdek";
import sequelize from "../../../lib/backend/sequelize";
import omit from "lodash/omit";

async function fetch(cityId) {
  // const [cdek, pickpoint] = await Promise.all([
  //   cdekPoints(),
  //   pickpointPoints(),
  // ]);

  // return cdek.concat(pickpoint);

  const city = await sequelize.models.City.findByPk(cityId);

  if (city === null) {
    return [];
  }

  let query = {};

  const cdekCode = city.get("cdekCode");
  const pickpointId = city.get("pickpointId");

  if (cdekCode && pickpointId) {
    query = {
      [Op.or]: [
        { type: "cdek", city: cdekCode },
        { type: "pickpoint", city: pickpointId },
      ],
    };
  } else if (cdekCode) {
    query = {
      type: "cdek",
      city: cdekCode,
    };
  } else {
    query = {
      type: "pickpoint",
      city: pickpointId,
    };
  }

  const points = await sequelize.models.Point.findAll({
    raw: true,
    where: query,
  });

  return points.map((point) => omit(point, "createdAt", "updatedAt"));
}

export default async function points(req, res) {
  const {
    query: { city },
  } = req;

  res.status(200).json(await fetch(city));
}

import { calculate as calculateCdek } from "../../../lib/backend/cdek";
import { calcTariff as calculatePickpoint } from "../../../lib/backend/pickpoint";

export default async function (req, res) {
  // FIXME тут нужно хорошенько отвалидировать поля
  if (req.method !== "POST") {
    return res.status(405).json({});
  }

  res.status(200).json(await calculate(req.body));
}

async function calculate({ type, address, coordinates, company, point_id }) {
  if (type === "store" && company === "pickpoint") {
    const { DPMax, DPMin, Services } = await calculatePickpoint({ point_id });

    return {
      total_sum: Math.ceil(
        Services.reduce((sum, { Tariff }) => sum + Tariff, 0)
      ),
      period_min: parseInt(DPMin),
      period_max: parseInt(DPMax),
    };
  } else {
    return await calculateCdek({
      type,
      address,
      coordinates,
    });
  }
}

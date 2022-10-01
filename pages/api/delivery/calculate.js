import { calculate } from "../../../lib/backend/cdek";

export default async function (req, res) {
  // FIXME тут нужно хорошенько отвалидировать поля
  if (req.method !== "POST") {
    return res.status(405).json({});
  }

  res.status(200).json(await calculate(req.body));
}

import { deliveryPoints } from "../../../lib/backend/cdek";

export default async function points(req, res) {
  // FIXME тут стоит, наверное, вычищать ненужные поля, чтобы
  // уменьшить трафик
  res.status(200).json(await deliveryPoints());
}

import { createSBPPayment } from "../../lib/backend/yookassa";

export default async function sbp(req, res) {
  res.status(200).json({ url: await createSBPPayment(req.body.sum) });
}

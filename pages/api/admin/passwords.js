import { notifyOfPasswordSet } from "../../../lib/backend/bot";
import { restricted } from "../../../lib/middleware/admin";

export default restricted(async function passwords(req, res) {
  if (req.method === "POST") {
    await notifyOfPasswordSet(req.body);

    return res.status(200).json({});
  }

  res.status(405).json({});
});

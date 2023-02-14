import sequelize, { BotUser } from "../../../lib/backend/sequelize";
import get from "lodash/get";

export default async function authorize(req, res) {
  if (req.method === "POST") {
    const input = get(req, "body.data", "");

    const params = new URLSearchParams(input);
    const hashToCheck = params.get("hash");

    params.delete("hash");
    params.sort();

    const data = Array.from(params.entries())
      .map((entry) => entry.join("="))
      .join("\n");

    const secretKey = createHmac("sha256", "WebAppData")
      .update(process.env.TELEGRAM_API_TOKEN)
      .digest();

    const hash = createHmac("sha256", secretKey).update(data).digest("hex");

    if (hash !== hashToCheck) {
      return res.status(401).json({});
    }

    const { id } = JSON.parse(params.get("user"));
    const user = await BotUser.findOne({ where: { chatId: id } });

    if (!user || !user.confirmed) {
      return res.status(401).json({});
    }

    res.status(200).json({});
  }

  res.status(405).json({});
}

import sequelize, { BotUser } from "../../../lib/backend/sequelize";

//query_id=AAFd8I0KAAAAAF3wjQpyfMUw&user=%7B%22id%22%3A177074269%2C%22first_name%22%3A%22%D0%94%D0%BC%D0%B8%D1%82%D1%80%D0%B8%D0%B9%22%2C%22last_name%22%3A%22%D0%9A%D1%83%D1%80%D1%82%D0%B5%D0%B5%D0%B2%22%2C%22username%22%3A%22turbokuzmich%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1676299179&hash=9482a76bbf29d2358f986c0d94cfb6e2708a517d5b721285b41dfe6495b5c542
export default async function authorize(req, res) {
  // const checkString = entries(omit(req.query, "hash"))
  //   .map(([key, value]) => `${key}=${value}`)
  //   .sort()
  //   .join("\n");

  // const secretKey = createHash("sha256")
  //   .update(process.env.TELEGRAM_API_TOKEN)
  //   .digest();

  // const hash = createHmac("sha256", secretKey)
  //   .update(checkString)
  //   .digest("hex");

  // if (hash !== query.hash) {
  //   return res.status(401).json({});
  // }

  //   if (hash === req.query.hash) {
  //     res.status(200).json({});
  //   } else {
  //     res.status(401).json({});
  //   }
}

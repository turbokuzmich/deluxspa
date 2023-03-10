import { restricted } from "../../../lib/middleware/admin";
import { sendPassword } from "../../../lib/backend/queue";
import { addEmailPassword, addSitePassword } from "../../../lib/backend/cloud";
import { LockBoxSite, LockBoxSiteName } from "../../../lib/backend/sequelize";

export default restricted(async function passwords(req, res) {
  if (req.method === "POST") {
    const data = req.body;

    if (data.type === "email") {
      const { key, password, userId } = data;

      await addEmailPassword(key, password);
      await sendPassword(key, key, "email", userId);
    }
    if (data.type === "site") {
      const { url, brief, name, login, password, names, userId } = data;
      const lockBoxKey = await addSitePassword(password);

      const site = await LockBoxSite.create({
        name,
        brief,
        url,
        login,
        lockBoxKey,
      });

      await LockBoxSiteName.bulkCreate(
        names.split("\n").map((name) => ({
          LockBoxSiteId: site.id,
          name,
        }))
      );

      await sendPassword(name, site.id, "site", userId);
    }
    return res.status(200).json({});
  }

  res.status(405).json({});
});

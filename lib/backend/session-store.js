import fs from "fs";
import get from "lodash/get";
import pick from "lodash/pick";
import sequelize from "./sequelize";
import { promisify } from "util";
import { resolve } from "path";

const filePath = resolve(process.cwd(), "session.json");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const sessionStore = {
  async get(sessionId) {
    const dbSession = await sequelize.models.session.findOne({
      where: { sessionId },
    });

    if (dbSession === null) {
      return undefined;
    }

    const session = {
      cookie: {
        ...pick(
          dbSession.toJSON(),
          "httpOnly",
          "path",
          "domain",
          "secure",
          "maxAge",
          "expires"
        ),
        sameSite: dbSession.sameSite === "true" ? true : dbSession.sameSite,
      },
    };

    const items = (await dbSession.getCartItems()).map((item) => item.toJSON());

    return { ...session, items };
  },
  async set(
    sessionId,
    {
      items,
      cookie: { httpOnly, path, domain, secure, sameSite, maxAge, expires },
    }
  ) {
    let session = await sequelize.models.session.findOne({
      where: { sessionId },
    });

    if (session === null) {
      session = await sequelize.models.session.create({
        sessionId,
        httpOnly,
        path,
        domain,
        secure,
        sameSite: sameSite === true ? "true" : sameSite,
        maxAge,
        expires,
      });
    }

    const currentItems = (await session.getCartItems()).reduce(
      (items, item) => ({ ...items, [item.itemId]: item }),
      {}
    );

    const { update, create } = items.reduce(
      (actions, item) => {
        if (item.itemId in currentItems) {
          if (currentItems[item.itemId].qty !== item.qty) {
            actions.update.push(
              currentItems[item.itemId].update({ qty: item.qty })
            );
          }
        } else {
          actions.create.push(
            sequelize.models.cartItem.create({ sessionId: session.id, ...item })
          );
        }

        return actions;
      },
      { update: [], create: [] }
    );

    await Promise.all([...update, ...create]);
  },
  async destroy(sid) {},
  async touch(sid, session) {
    await sessionStore.get(sid, session);
  },
};

export default sessionStore;

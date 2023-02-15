import omit from "lodash/omit";
import isNil from "lodash/isNil";
import negate from "lodash/negate";
import sequelize from "./sequelize";
import identity from "lodash/identity";
import fromPairs from "lodash/fromPairs";
import differenceWith from "lodash/differenceWith";

const isNotNil = negate(isNil);
const makeId = (item) => `${item.itemId}-${item.variantId}`;

const cookieKeys = [
  { key: "httpOnly" },
  { key: "path" },
  { key: "domain" },
  { key: "secure" },
  { key: "maxAge" },
  { key: "expires" },
  {
    key: "sameSite",
    to(value) {
      return value === true ? "true" : value;
    },
    from(value) {
      return value === "true" ? true : value;
    },
  },
];

const omitItemsKeys = ["createdAt", "updatedAt", "id", "sessionId"];

const sessionStore = {
  async get(sessionId) {
    const db = await sequelize;

    const dbSession = await db.models.Session.findOne({
      where: { sessionId },
    });

    if (dbSession === null) {
      return null;
    }

    const jsonSession = dbSession.toJSON();

    if (dbSession.expires && dbSession.expires.getTime() <= Date.now()) {
      await sessionStore.destroy(sessionId);

      return null;
    }

    return {
      sessionId,
      cookie: fromPairs(
        cookieKeys
          .map(({ key, filter = isNotNil, from = identity }) => ({
            key,
            filter,
            value: from(jsonSession[key]),
          }))
          .filter(({ filter, value }) => filter(value))
          .map(({ key, value }) => [key, value])
      ),
      items: (await dbSession.getCartItems()).map((item) =>
        omit(item.toJSON(), omitItemsKeys)
      ),
    };
  },
  async set(sessionId, { items, cookie }, forceUpdate = false) {
    const db = await sequelize;

    let session = await db.models.Session.findOne({
      where: { sessionId },
    });

    if (session === null) {
      session = await db.models.Session.create({
        sessionId,
        ...fromPairs(
          cookieKeys
            .map(({ key, to = identity, filter = isNotNil }) => ({
              key,
              filter,
              value: to(cookie[key]),
            }))
            .filter(({ value, filter }) => filter(value))
            .map(({ key, value }) => [key, value])
        ),
      });
    }

    const { currentItems, currentIds } = (await session.getCartItems()).reduce(
      (result, item) => {
        const id = makeId(item);

        result.currentIds.push([item.id, id]);

        result.currentItems = {
          ...result.currentItems,
          [id]: item,
        };

        return result;
      },
      { currentIds: [], currentItems: {} }
    );

    const { update, create, ids } = items.reduce(
      (actions, item) => {
        const id = makeId(item);

        if (id in currentItems) {
          if (currentItems[id].qty !== item.qty) {
            actions.update.push(currentItems[id].update({ qty: item.qty }));
          }
        } else {
          actions.create.push(
            db.models.CartItem.create({ SessionId: session.id, ...item })
          );
        }

        actions.ids.push(id);

        return actions;
      },
      { ids: [], update: [], create: [] }
    );

    const itemsIdsToRemove = differenceWith(
      currentIds,
      ids,
      ([_, currentId], id) => id === currentId
    ).map(([id]) => id);

    const remove =
      itemsIdsToRemove.length > 0
        ? [db.models.CartItem.destroy({ where: { id: itemsIdsToRemove } })]
        : [];

    const sessionTouch =
      forceUpdate ||
      update.length > 0 ||
      create.length > 0 ||
      itemsIdsToRemove.length > 0
        ? [session.update({ touchedAt: new Date() })]
        : [];

    await Promise.all([...update, ...create, ...remove, ...sessionTouch]);
  },
  async destroy(sid) {
    const db = await sequelize;

    await db.models.Session.destroy({ where: { sessionId: sid } });
  },
  async touch(sid, session) {
    await sessionStore.set(sid, session, true);
  },
};

export default sessionStore;

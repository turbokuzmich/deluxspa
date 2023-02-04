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

    const dbSession = await db.models.session.findOne({
      where: { sessionId },
    });

    if (dbSession === null) {
      return undefined;
    }

    const jsonSession = dbSession.toJSON();

    return {
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
  async set(sessionId, { items, cookie }) {
    const db = await sequelize;

    let session = await db.models.session.findOne({
      where: { sessionId },
    });

    if (session === null) {
      session = await db.models.session.create({
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
            db.models.cartItem.create({ sessionId: session.id, ...item })
          );
        }

        actions.ids.push(id);

        return actions;
      },
      { ids: [], update: [], create: [] }
    );

    const deletes = differenceWith(
      currentIds,
      ids,
      ([_, currentId], id) => id === currentId
    ).map(([id]) => id);

    await Promise.all([
      ...update,
      ...create,
      ...(deletes.length > 0
        ? [db.models.cartItem.destroy({ where: { id: deletes } })]
        : []),
    ]);
  },
  async destroy(sid) {
    const db = await sequelize;

    await db.models.session.destroy({ where: { sessionId: sid } });
  },
  async touch(sid, session) {
    await sessionStore.get(sid, session);
  },
};

export default sessionStore;

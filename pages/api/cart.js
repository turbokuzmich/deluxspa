import get from "lodash/get";
import withSession, { getSession } from "../../lib/backend/session";

// TODO move
import "../../lib/backend/cron";
import runBot from "../../lib/backend/bot";

runBot();

// TODO yup validation
export default async function cart(req, res) {
  if (req.method === "GET") {
    await withSession(
      async function (session) {
        res.status(200).json({ items: get(session, "items", []) });
      },
      req,
      res
    );
  } else if (req.method === "POST") {
    const session = await withSession(
      async function (session) {
        const { id, variant: variantStr, qty = 1, append = false } = req.body;
        const variant = parseInt(variantStr, 10);
        const items = get(session, "items", []);
        const itemsIndex = items.findIndex(
          ({ itemId, variantId }) => itemId === id && variantId === variant
        );

        if (itemsIndex > -1) {
          const currentQty = items[itemsIndex].qty;
          const newQty = append ? currentQty + qty : qty;

          if (newQty === 0) {
            session.items[itemsIndex].qty = 0;
            session.items.splice(itemsIndex, 1);
          } else {
            session.items[itemsIndex].qty = newQty;
          }
        } else {
          session.items.push({
            qty,
            itemId: id,
            variantId: variant,
          });
        }
      },
      req,
      res
    );

    res.status(200).json({ items: session.items });
  } else {
    res.status(405).json({});
  }
}

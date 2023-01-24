import get from "lodash/get";
import { getSession } from "../../lib/helpers/session";

export default async function cart(req, res) {
  if (req.method === "GET") {
    const session = await getSession(req, res);

    res.status(200).json({ items: get(session, "items", []) });
  } else if (req.method === "POST") {
    const session = await getSession(req, res);

    const { id, variant: variantStr, qty = 1, append = false } = req.body;
    const variant = parseInt(variantStr, 10);
    const items = get(session, "items", []);
    const itemsIndex = items.findIndex(
      ({ itemId, variantId }) => itemId === id && variantId === variant
    );

    if (itemsIndex > -1) {
      const currentQty = items[itemsIndex].qty;
      const newQty = append ? currentQty + qty : qty;

      session.items[itemsIndex].qty = newQty;
    } else {
      session.items = [
        ...items,
        {
          qty,
          itemId: id,
          variantId: variant,
        },
      ];
    }

    await session.commit();

    res.status(200).json({ items: session.items });
  } else {
    res.status(405).json({});
  }
}

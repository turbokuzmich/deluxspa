import get from "lodash/get";
import { getSession } from "../../lib/helpers/session";

export default async function cart(req, res) {
  if (req.method === "POST") {
    const { id, qty = 1, append = false } = req.body;
    const session = await getSession(req, res);

    const items = get(session, "items", {});
    const currentQty = get(items, id, 0);
    const newQty = append ? currentQty + qty : qty;

    session.items = {
      ...items,
      [id]: newQty,
    };

    await session.commit();

    res.status(200).json({ items: session.items });
  } else {
    res.status(405).json({});
  }
}

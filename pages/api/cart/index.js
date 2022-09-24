import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";

async function getOrCreateCart({ user: { email } }) {
  return { items: [] };
  // const {
  //   data: {
  //     data: [{ id: userId }],
  //   },
  // } = await api.get("/site-users", {
  //   params: {
  //     "filters[email]": email,
  //   },
  // });

  // const {
  //   data: { data: items },
  // } = await api.get("/cart-items", {
  //   params: {
  //     "filters[site_user][id]": userId,
  //   },
  // });

  // return {
  //   items: items.map(({ attributes: { item_id, quantity } }) => ({
  //     id: item_id,
  //     qty: quantity,
  //   })),
  // };
}

export default async function cart(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401);
  }

  res.status(200).json(await getOrCreateCart(session));
}

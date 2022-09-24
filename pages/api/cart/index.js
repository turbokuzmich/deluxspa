import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import sequelize from "../../../lib/backend/sequelize";

const emptyCart = { items: [] };

async function getOrCreateCart(user) {
  const items = await user.getCartItems();

  return {
    items: items.map((item) => ({ id: item.item_id, quantity: item.quantity })),
  };
}

export default async function cart(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(200).json(emptyCart);
  }

  const user = await sequelize.models.User.findOne({
    where: { email: session.user.email },
  });

  if (user === null) {
    return res.status(200).json(emptyCart);
  }

  res.status(200).json(await getOrCreateCart(user));
}

import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import sequelize from "../../../lib/backend/sequelize";

const emptyCart = { items: [] };

async function getCartItems(user) {
  const items = await user.getCartItems();

  return {
    items: items.map((item) => ({ id: item.item_id, quantity: item.quantity })),
  };
}

async function changeCartItem(user, { id, qty = 1, append = false }) {
  const cartItems = await user.getCartItems({ where: { item_id: id } });

  if (cartItems.length === 0) {
    const cartItem = await sequelize.models.CartItem.create({
      item_id: id,
      quantity: qty,
    });

    await cartItem.setUser(user);

    return getCartItems(user);
  }

  const [cartItem] = cartItems;

  cartItem.quantity = append ? cartItem.quantity + qty : qty;

  if (cartItem.qty === 0) {
    await cartItem.destroy();
  } else {
    await cartItem.save();
  }

  return getCartItems(user);
}

async function removeCartItem(user, id) {}

export default async function cart(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json(emptyCart);
  }

  const user = await sequelize.models.User.findOne({
    where: { email: session.user.email },
  });

  if (user === null) {
    return res.status(401).json(emptyCart);
  }

  if (req.method === "GET") {
    res.status(200).json(await getCartItems(user));
  } else if (req.method === "POST") {
    res.status(200).json(await changeCartItem(user, req.body));
  } else if (req.method === "DELETE") {
    res.status(200).json(await removeCartItem(user, req.body.id));
  } else {
    res.status(405).json({});
  }
}

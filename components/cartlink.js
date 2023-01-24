import Link from "next/link";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useSelector } from "react-redux";
import { getCartItemsCount } from "../store/slices/cart";

export default function CartLink() {
  const cartItemsCount = useSelector(getCartItemsCount);

  return cartItemsCount ? (
    <Link href="/cart" passHref>
      <IconButton component="a">
        <Badge badgeContent={cartItemsCount} color="success">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Link>
  ) : (
    <Link href="/cart" passHref>
      <IconButton component="a">
        <ShoppingCartIcon />
      </IconButton>
    </Link>
  );
}

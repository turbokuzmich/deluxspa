import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import Price from "../../components/price";
import cart, {
  getCartItemsCount,
  getCartSubtotal,
} from "../../store/slices/cart";

export default function Cart() {
  const dispatch = useDispatch();

  const itemsCount = useSelector(getCartItemsCount);
  const cartSubtotal = useSelector(getCartSubtotal);

  const onBuy = useCallback(() => {
    dispatch(cart.actions.checkout());
  }, [dispatch]);

  return (
    <Layout>
      <>
        <Container>
          <Typography
            variant="h3"
            sx={{ textTransform: "uppercase" }}
            paragraph
          >
            Корзина
          </Typography>
          <Typography>Позиций: {itemsCount}</Typography>
          <Typography paragraph>
            Подытог: <Price sum={cartSubtotal} />
          </Typography>
          {itemsCount > 0 && cartSubtotal > 0 ? (
            <Button onClick={onBuy} variant="contained">
              Купить немедленно
            </Button>
          ) : null}
        </Container>
      </>
    </Layout>
  );
}

import Layout from "../../components/layout";
import Price from "../../components/price";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import { signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { format } from "date-fns";
import orders, { getState, getList } from "../../store/slices/orders";

export default function Personal({ email }) {
  const dispatch = useDispatch();

  const ordersState = useSelector(getState);
  const ordersList = useSelector(getList);

  const handleLogout = useCallback(() => signOut(), []);

  useEffect(() => {
    if (ordersState === "initial") {
      dispatch(orders.actions.fetchOrders());
    }
  }, [dispatch, ordersState]);

  return (
    <Layout>
      <Container>
        <Typography variant="h3" sx={{ textTransform: "uppercase" }} paragraph>
          Профиль {email}
        </Typography>
        {ordersList.length ? (
          <>
            <Typography variant="h4" paragraph>
              Заказы
            </Typography>
            {ordersList.map((order) => (
              <Box key={order.id} sx={{ mb: 4 }}>
                <Typography variant="h5" paragraph>
                  {order.name} от{" "}
                  {format(new Date(order.createdAt), "dd.MM.yyyy H:mm")} на
                  сумму <Price sum={order.price} />. Статус — {order.status}.
                </Typography>
                {order.payLink ? (
                  <Typography sx={{ pl: 2 }} paragraph>
                    <Link target="_blank" href={order.payLink}>
                      Ссылка на оплату
                    </Link>
                  </Typography>
                ) : null}
                <Typography sx={{ pl: 2 }} paragraph>
                  Ваш заказ обслуживает {order.responsible.name} (
                  <Link
                    target="_blank"
                    href={`mailto:${order.responsible.email}`}
                  >
                    {order.responsible.email}
                  </Link>
                  ).
                </Typography>
                <Typography sx={{ pl: 2 }} paragraph>
                  История заказа:
                </Typography>
                {order.events.map((event) => (
                  <Typography key={event.id} sx={{ pl: 4 }} paragraph>
                    {event.text}
                  </Typography>
                ))}
                <Typography sx={{ pl: 2 }} paragraph>
                  Состав заказа:
                </Typography>
                {order.items.map((item) => (
                  <Typography
                    key={`${order.id}-${item.item_id}`}
                    sx={{ pl: 4 }}
                    paragraph
                  >
                    {item.brief} «{item.title}» ({item.volume} мл) —{" "}
                    {item.quantity} x {item.price} ₽
                  </Typography>
                ))}
              </Box>
            ))}
          </>
        ) : null}
        <Typography>
          <Button variant="contained" onClick={handleLogout}>
            Выйти
          </Button>
        </Typography>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const {
    user: { email },
  } = session;

  return {
    props: { email },
  };
}

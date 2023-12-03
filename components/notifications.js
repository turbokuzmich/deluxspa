import A from "@mui/material/Link";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import decline from "../lib/helpers/declension";
import { format } from "../lib/helpers/numeral";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCartItemsCount, getCartSubtotal } from "../store/slices/cart";
import notificationsSlice, {
  getNotifications,
} from "../store/slices/notifications";

export function DefaultBody({ notification }) {
  return (
    <>
      {notification.title ? (
        <AlertTitle>{notification.title}</AlertTitle>
      ) : null}
      {notification.message}
    </>
  );
}

export function CartBody({ onClose }) {
  const count = useSelector(getCartItemsCount);
  const total = useSelector(getCartSubtotal);

  return (
    <>
      <AlertTitle>Товар добавлен в корзину</AlertTitle>
      <Typography paragraph>
        В корзине {count} {decline(count, ["товар", "товара", "товаров"])} на
        сумму {format(total)} ₽
      </Typography>
      <Link href="/cart" passHref>
        <A data-variant="footer" variant="button" onClick={onClose}>
          Оплатить
        </A>
      </Link>
    </>
  );
}

export default function Notifications() {
  const dispatch = useDispatch();

  const notifications = useSelector(getNotifications);

  const reverseNotifications = useMemo(
    () => [...notifications].reverse(),
    [notifications]
  );

  const closeHandlers = useMemo(
    () =>
      reverseNotifications.map(
        (notification) => () =>
          dispatch(notificationsSlice.actions.remove(notification.id))
      ),
    [reverseNotifications, dispatch]
  );

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        bottom: theme.spacing(2),
        left: theme.spacing(2),
        zIndex: 100,
      })}
    >
      <Stack
        spacing={2}
        sx={{
          width: "30vw",
        }}
      >
        {reverseNotifications.map((notification, index) => {
          return (
            <Alert
              key={notification.id}
              severity={notification.severity}
              variant="filled"
              onClose={closeHandlers[index]}
              sx={{ pt: 2, pb: 2, pl: 4, pr: 4 }}
            >
              {notification.type === "cart" ? (
                <CartBody
                  notification={notification}
                  onClose={closeHandlers[index]}
                />
              ) : (
                <DefaultBody notification={notification} />
              )}
            </Alert>
          );
        })}
      </Stack>
    </Box>
  );
}

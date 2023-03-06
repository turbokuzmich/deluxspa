import { useEffect, useMemo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrdersData,
  getOrdersViewState,
} from "../../../admin/store/slices/orders";
import {
  getHumanStatus,
  getAvailableStatusesForStatus,
} from "../../../lib/helpers/order";
import { orderStatusesKeys, orderStatusesWeights } from "../../../constants";
import { formatDate } from "../../../lib/helpers/date";
import { formatPhone } from "../../../lib/helpers/phone";
import get from "lodash/get";
import orders from "../../../admin/store/slices/orders";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Price from "../../../components/price";
import A from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import PaidIcon from "@mui/icons-material/Paid";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Divider from "@mui/material/Divider";
import EditIcon from "@mui/icons-material/Edit";
import Fab from "@mui/material/Fab";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

const statusIcons = {
  [orderStatusesKeys.created]: <AccessTimeFilledIcon fontSize="small" />,
  [orderStatusesKeys.pending]: <AccessTimeFilledIcon fontSize="small" />,
  [orderStatusesKeys.waiting_for_capture]: (
    <AccessTimeFilledIcon fontSize="small" />
  ),
  [orderStatusesKeys.succeeded]: <PaidIcon fontSize="small" />,
  [orderStatusesKeys.canceled]: <DoNotDisturbOnIcon fontSize="small" />,
  [orderStatusesKeys.preparing]: <FactCheckIcon fontSize="small" />,
  [orderStatusesKeys.shipping]: <LocalShippingIcon fontSize="small" />,
  [orderStatusesKeys.delivered]: <CheckCircleIcon fontSize="small" />,
};

export default function Order({ id }) {
  const dispatch = useDispatch();

  const states = useSelector(getOrdersViewState);
  const datas = useSelector(getOrdersData);

  const state = useMemo(() => get(states, id, "initial"), [states, id]);
  const order = useMemo(() => get(datas, id), [datas, id]);
  const status = get(order, "status");

  const availableStatuses = useMemo(
    () =>
      getAvailableStatusesForStatus(status)
        .sort(
          (statusA, statusB) =>
            orderStatusesWeights[statusA] - orderStatusesWeights[statusB]
        )
        .map((status) => ({
          title: getHumanStatus(status),
          value: status,
        })),
    [status]
  );

  const [isOrderMenuVisible, setIsOrderMenuVisible] = useState(false);

  const onEditButtonClick = useCallback(() => {
    setIsOrderMenuVisible(true);
  }, [setIsOrderMenuVisible]);

  const onOrderMenuOpen = useCallback(() => {
    setIsOrderMenuVisible(false);
  }, [setIsOrderMenuVisible]);

  const onOrderMenuClose = useCallback(() => {
    setIsOrderMenuVisible(false);
  }, [setIsOrderMenuVisible]);

  useEffect(() => {
    if (state === "initial") {
      dispatch(orders.actions.fetchOrder(id));
    }
  }, [dispatch, state, id]);

  return (
    <>
      {state === "fetched" ? (
        <>
          <Fab
            onClick={onEditButtonClick}
            color="primary"
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
            }}
          >
            <EditIcon />
          </Fab>
          <Breadcrumbs sx={{ mb: 4 }}>
            <Link href="/admin/" passHref>
              <A>Главная</A>
            </Link>
            <Link href="/admin/orders" passHref>
              <A>Заказы</A>
            </Link>
            <Typography color="text.primary">Заказ №{id}</Typography>
          </Breadcrumbs>
          <SwipeableDrawer
            anchor="bottom"
            open={isOrderMenuVisible}
            onOpen={onOrderMenuOpen}
            onClose={onOrderMenuClose}
          >
            <MenuList>
              {availableStatuses.map(({ title, value }) => [
                value === orderStatusesKeys.canceled ? (
                  <Divider key={`${value}-divider`} />
                ) : null,
                <MenuItem key={value} onClick={onOrderMenuClose}>
                  <ListItemIcon>{statusIcons[value]}</ListItemIcon>
                  <ListItemText>{title}</ListItemText>
                </MenuItem>,
              ])}
            </MenuList>
          </SwipeableDrawer>
          <TableContainer sx={{ marginBottom: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">ID</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>{order.id}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Статус</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>{getHumanStatus(order.status)}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Общая сумма</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>
                      <Price sum={order.total} />
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Сумма товаров</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>
                      <Price sum={order.subtotal} />
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Сумма доставки</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>
                      <Price sum={order.delivery} />
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Создан</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>
                      {formatDate(new Date(order.createdAt))}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Телефон</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>
                      <A href={`tel:+7${order.phone}`}>
                        {formatPhone(order.phone)}
                      </A>
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Email</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>
                      {order.email ? (
                        <A href={`mailto:${order.email}`}>{order.email}</A>
                      ) : (
                        "—"
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    component="th"
                    sx={{ borderBottomColor: "transparent", pl: 0 }}
                  >
                    <Typography fontWeight="bold">Пукнкт доставки</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ borderBottomColor: "transparent", pr: 0 }}
                  >
                    <Typography>{order.code}</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Состав
          </Typography>
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableBody>
                {order.OrderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell
                      width={"100%"}
                      sx={{ borderBottomColor: "transparent", pl: 0 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          maxWidth: "45vw",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.brief}
                      </Typography>
                      <Typography fontWeight="bold" textTransform="uppercase">
                        {item.title}
                      </Typography>
                      <Typography variant="caption">{item.capacity}</Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        verticalAlign: "top",
                        borderBottomColor: "transparent",
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        &nbsp;
                      </Typography>
                      <Typography>{item.qty}</Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        pr: 0,
                        verticalAlign: "top",
                        borderBottomColor: "transparent",
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        &nbsp;
                      </Typography>
                      <Typography>
                        <Price sum={item.total} />
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {order.comment ? (
            <>
              <Typography
                variant="h4"
                sx={{
                  mb: 2,
                }}
              >
                Комментарий
              </Typography>
              <Typography>{order.comment}</Typography>
            </>
          ) : null}
        </>
      ) : null}
      {state === "initial" || state === "fetching" ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : null}
      {state === "failed" ? (
        <Alert severity="error">Не удалось получить список заказов</Alert>
      ) : null}
    </>
  );
}

export async function getServerSideProps({ params: { id } }) {
  return {
    props: {
      title: `Заказ №${id}`,
      id,
    },
  };
}

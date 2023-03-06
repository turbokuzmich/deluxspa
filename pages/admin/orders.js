import Layout from "../../admin/components/layout";
import * as Color from "color";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Price from "../../components/price";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import Divider from "@mui/material/Divider";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { formatDate } from "../../lib/helpers/date";
import { formatPhone } from "../../lib/helpers/phone";
import { getHumanStatus } from "../../lib/helpers/order";
import { useTheme } from "@mui/material";
import ordersSlice, {
  getOrder,
  getOrdersList,
  getOrdersState,
} from "../../admin/store/slices/orders";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getAuthState } from "../../admin/store/slices/auth";

export default function Admin() {
  const { query, replace } = useRouter();

  const dispatch = useDispatch();

  const auth = useSelector(getAuthState);
  const orders = useSelector(getOrdersList);
  const state = useSelector(getOrdersState);
  const order = useSelector(getOrder);

  const [isOrderMenuVisible, setIsOrderMenuVisible] = useState(false);

  const moreButtonRef = useRef();

  const {
    palette: {
      background: { paper },
    },
  } = useTheme();

  const drawerGradients = useMemo(
    () => [paper, Color(paper).alpha(0).toString()],
    [paper]
  );

  const onOrderClicks = useMemo(
    () =>
      orders.map(
        ({ id }) =>
          () =>
            dispatch(ordersSlice.actions.setOrder(id))
      ),
    [dispatch, orders]
  );

  const onDrawerOpen = useCallback(() => {}, []);

  const onDrawerClose = useCallback(
    () => dispatch(ordersSlice.actions.setOrder(null)),
    [dispatch]
  );

  const onMoreButtonClick = useCallback(() => {
    setIsOrderMenuVisible(true);
  }, [setIsOrderMenuVisible]);

  const onOrderMenuClose = useCallback(() => {
    setIsOrderMenuVisible(false);
  }, [setIsOrderMenuVisible]);

  useEffect(() => {
    if (auth === "authorized" && state === "initial") {
      dispatch(ordersSlice.actions.fetch());
    }
  }, [dispatch, state, auth]);

  useEffect(() => {
    if (state === "fetched" && query.order_id) {
      const strippedUrl = new URL(location.href);

      strippedUrl.searchParams.delete("order_id");

      replace(strippedUrl);

      dispatch(ordersSlice.actions.setOrder(query.order_id));
    }
  }, [state, query, dispatch, replace]);

  return (
    <Layout title="Заказы">
      <Menu
        anchorEl={moreButtonRef.current}
        open={isOrderMenuVisible}
        onClose={onOrderMenuClose}
      >
        <MenuItem onClick={onOrderMenuClose}>
          <ListItemIcon>
            <AccessTimeFilledIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>В обработке</ListItemText>
        </MenuItem>
        <MenuItem onClick={onOrderMenuClose}>
          <ListItemIcon>
            <LocalShippingIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>В пути</ListItemText>
        </MenuItem>
        <MenuItem onClick={onOrderMenuClose}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Доставлен</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onOrderMenuClose}>
          <ListItemIcon>
            <DoNotDisturbOnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Отменить</ListItemText>
        </MenuItem>
      </Menu>
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(order)}
        onOpen={onDrawerOpen}
        onClose={onDrawerClose}
      >
        {order ? (
          <Box
            sx={{
              position: "relative",
              height: "80vh",
              ":before": {
                position: "absolute",
                content: "''",
                top: 0,
                left: 0,
                right: 0,
                height: 40,
                pointerEvents: "none",
                background: `linear-gradient(${drawerGradients.join(",")})`,
              },
              ":after": {
                position: "absolute",
                content: "''",
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                pointerEvents: "none",
                background: `linear-gradient(${[
                  drawerGradients[1],
                  drawerGradients[0],
                ].join(",")})`,
              },
            }}
          >
            <Box
              sx={{
                height: "80vh",
                pt: "40px",
                pb: "40px",
                overflowY: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 2,
                  pt: 0,
                }}
              >
                <Typography variant="h4" sx={{ pb: "5px" }}>
                  Заказ
                </Typography>
                <IconButton ref={moreButtonRef} onClick={onMoreButtonClick}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">ID</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography>{order.id}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">Статус</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography>{getHumanStatus(order.status)}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">Общая сумма</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography>
                          <Price sum={order.total} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">Сумма товаров</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography>
                          <Price sum={order.subtotal} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">
                          Сумма доставки
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography>
                          <Price sum={order.delivery} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">Создан</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography>
                          {formatDate(new Date(order.createdAt))}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">Телефон</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
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
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">Email</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
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
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography fontWeight="bold">
                          Пукнкт доставки
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottomColor: "transparent" }}
                      >
                        <Typography>{order.code}</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{
                  p: 2,
                  pt: 4,
                }}
              >
                <Typography variant="h4">Состав</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {order.OrderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell
                          width={"100%"}
                          sx={{ borderBottomColor: "transparent" }}
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
                          <Typography
                            fontWeight="bold"
                            textTransform="uppercase"
                          >
                            {item.title}
                          </Typography>
                          <Typography variant="caption">
                            {item.capacity}
                          </Typography>
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
                <Box
                  sx={{
                    p: 2,
                    pt: 4,
                    pb: 0,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                    }}
                  >
                    Комментарий
                  </Typography>
                  <Typography>{order.comment}</Typography>
                </Box>
              ) : null}
            </Box>
          </Box>
        ) : null}
      </SwipeableDrawer>
      <TableContainer sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right">
                <Typography variant="caption" fontWeight="bold">
                  ID
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" fontWeight="bold">
                  Создан
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" fontWeight="bold">
                  Сумма
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" fontWeight="bold">
                  Статус
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={order.id} onClick={onOrderClicks[index]}>
                <TableCell
                  align="right"
                  sx={{
                    borderBottomColor: "transparent",
                  }}
                >
                  <Typography variant="body2">{order.id}</Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottomColor: "transparent",
                  }}
                >
                  <Typography whiteSpace="nowrap" variant="body2">
                    {formatDate(new Date(order.createdAt), true)}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottomColor: "transparent",
                  }}
                >
                  <Typography whiteSpace="nowrap" variant="body2">
                    <Price sum={order.total} />
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottomColor: "transparent",
                  }}
                >
                  <Typography whiteSpace="nowrap" variant="body2">
                    {getHumanStatus(order.status)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {state === "initial" || state === "fetching" ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : null}
      {state === "failed" ? (
        <Alert severity="error">Не удалось получить список заказов</Alert>
      ) : null}
    </Layout>
  );
}

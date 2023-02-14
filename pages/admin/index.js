import * as Color from "color";
import Script from "next/script";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import LockIcon from "@mui/icons-material/Lock";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Price from "../../components/price";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate } from "../../lib/helpers/date";
import { formatPhone } from "../../lib/helpers/phone";
import { getHumanStatus } from "../../lib/helpers/order";
import api from "../../lib/frontend/api";
import { useTheme } from "@mui/material";

export default function Admin() {
  const [status, setStatus] = useState("initial");
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);

  const {
    palette: {
      background: { paper },
    },
  } = useTheme();

  const drawerGradients = useMemo(
    () => [paper, Color(paper).alpha(0).toString()],
    [paper]
  );

  const onApiLoaded = useCallback(async () => {
    try {
      await api.post("/admin/auth", {
        data: Telegram.WebApp.initDataUnsafe,
      });

      setStatus("authorized");
    } catch (error) {
      setStatus("unauthorized");
    }
  }, [setStatus]);

  const onOrderClicks = useMemo(
    () => orders.map((order) => () => setOrder(order)),
    [orders, setOrder]
  );

  const onDrawerOpen = useCallback(() => {}, []);

  const onDrawerClose = useCallback(() => {
    setOrder(null);
  }, [setOrder]);

  useEffect(() => {
    if (status === "authorized") {
      api
        .post("/admin/orders", {
          data: Telegram.WebApp.initDataUnsafe,
        })
        .then(({ data }) => {
          setOrders(data);
        });
    }
  }, [status, setOrders]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={onApiLoaded}
      />
      <AppBar
        sx={{
          mb: 2,
        }}
      >
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit">
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Заказы
          </Typography>
          {status === "initial" ? <CircularProgress /> : null}
          {status === "unauthorized" ? <LockIcon /> : null}
          {status === "authorized" ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PersonIcon />
              <Typography variant="h6">
                {Telegram.WebApp.initDataUnsafe.user.first_name}
              </Typography>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>
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
                  p: 2,
                  pt: 0,
                }}
              >
                <Typography variant="h4">Заказ</Typography>
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
                  <Typography variant="h4">Комментарий</Typography>
                  <Typography>{order.comment}</Typography>
                </Box>
              ) : null}
            </Box>
          </Box>
        ) : null}
      </SwipeableDrawer>
      <Container sx={{ pt: 10 }}>
        {status === "unauthorized" ? (
          <Alert severity="error">У вас нет доступа к этой странице.</Alert>
        ) : null}
        {status === "authorized" ? (
          <TableContainer>
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
        ) : null}
      </Container>
    </>
  );
}

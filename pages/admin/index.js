import Script from "next/script";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Price from "../../components/price";
import { useCallback, useEffect, useState } from "react";
import { formatDate } from "../../lib/helpers/date";
import { formatPhone } from "../../lib/helpers/phone";
import api from "../../lib/frontend/api";

const Telegram = {
  WebApp: {
    initDataUnsafe: {
      user: {
        first_name: "Дмитрий",
      },
    },
  },
};

export default function Admin() {
  const [status, setStatus] = useState("initial");
  const [orders, setOrders] = useState([]);

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
        position="static"
        sx={{
          mb: 2,
        }}
      >
        <Toolbar>
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
                gap: 2,
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
      <Container>
        {status === "unauthorized" ? (
          <Alert severity="error">У вас нет доступа к этой странице.</Alert>
        ) : null}
        {status === "authorized" ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="right">ID</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell align="right">{order.id}</TableCell>
                    <TableCell>
                      {formatDate(new Date(order.createdAt))}
                    </TableCell>
                    <TableCell>
                      <A href={`tel:+7${order.phone}`}>
                        {formatPhone(order.phone)}
                      </A>
                    </TableCell>
                    <TableCell>
                      {order.email ? (
                        <A href={`mailto:${order.email}`}>{order.email}</A>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Price sum={order.total} />
                    </TableCell>
                    <TableCell>{order.status}</TableCell>
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

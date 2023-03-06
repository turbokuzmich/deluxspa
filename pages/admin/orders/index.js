import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Price from "../../../components/price";
import A from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { formatDate } from "../../../lib/helpers/date";
import { getHumanStatus } from "../../../lib/helpers/order";
import { useTheme } from "@mui/material";
import ordersSlice, {
  getOrdersIds,
  getOrdersData,
  getOrdersListState,
} from "../../../admin/store/slices/orders";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

export default function Admin() {
  const { push } = useRouter();

  const dispatch = useDispatch();

  const ordersIds = useSelector(getOrdersIds);
  const ordersData = useSelector(getOrdersData);
  const state = useSelector(getOrdersListState);

  const {
    palette: {
      background: { paper },
    },
  } = useTheme();

  const onOrderClicks = useMemo(
    () => ordersIds.map((id) => () => push(`/admin/orders/${id}`)),
    [ordersIds, push]
  );

  useEffect(() => {
    if (state === "initial") {
      dispatch(ordersSlice.actions.fetchList());
    }
  }, [dispatch, state]);

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/admin/" passHref>
          <A>Главная</A>
        </Link>
        <Typography color="text.primary">Заказы</Typography>
      </Breadcrumbs>
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
            {ordersIds.map((id, index) => {
              const order = ordersData[id];

              return (
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
              );
            })}
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
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      title: "Заказаы",
    },
  };
}

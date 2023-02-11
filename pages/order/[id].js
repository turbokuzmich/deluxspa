import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Order } from "../../lib/backend/sequelize";
import get from "lodash/get";
import pick from "lodash/pick";
import Box from "@mui/material/Box";
import Price from "../../components/price";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

export default function ViewOrder({
  error,
  address,
  status,
  externalId,
  total,
  items,
}) {
  const { t } = useTranslation();
  const { locale } = useRouter();

  const suffix = locale === "ru" ? "" : "_en";

  // TODO вы можете отслеживать заказ при помощи бота
  // TODO вы можете оставить нам свою электронную почту, чтобы получать уведомления
  return (
    <Layout title={t("page-title-order")}>
      <Container>
        <Box
          sx={{
            pt: 8,
          }}
        >
          {error ? (
            <Typography
              variant="h3"
              sx={{ textTransform: "uppercase" }}
              paragraph
            >
              {t("order-not-found-title")}
            </Typography>
          ) : (
            <>
              <Typography
                variant="h3"
                sx={{ textTransform: "uppercase" }}
                paragraph
              >
                {t("order-title")} {externalId}
              </Typography>
              <Typography>
                {t("order-status")}: {t(`order-status-${status}`)}
              </Typography>
              <Typography paragraph>
                {t("order-address")}:{" "}
                {address ? address : t("order-no-address")}
              </Typography>
              <Typography variant="h4" paragraph>
                {t("order-items-title")}
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={`${item.title_en}-${item.brief_en}-${item.capacity_en}`}
                      >
                        <TableCell>
                          <Typography>{item[`brief${suffix}`]}</Typography>
                          <Typography variant="h5" textTransform="uppercase">
                            {item[`title${suffix}`]},{" "}
                            {item[`capacity${suffix}`]}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ verticalAlign: "bottom" }}
                        >
                          <Typography variant="h5">
                            {item.qty} x <Price sum={item.price} />
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ verticalAlign: "bottom" }}
                        >
                          <Typography variant="h5">
                            <Price sum={item.total} />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={{ borderBottom: "none" }}></TableCell>
                      <TableCell sx={{ borderBottom: "none" }}></TableCell>
                      <TableCell
                        align="right"
                        sx={{ verticalAlign: "bottom", borderBottom: "none" }}
                      >
                        <Typography variant="h5" fontWeight="700">
                          <Price sum={total} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps({ locale, params: { id } }) {
  const props = {
    id,
    ...(await serverSideTranslations(locale, ["common"])),
  };

  const orderParts = id.split("-");
  const externalId = get(orderParts, 0);
  const hmac = get(orderParts, 1);

  if (!(externalId && hmac)) {
    return { props: { ...props, error: true } };
  }

  const order = await Order.getByExternalId(externalId);

  if (!order || !order.validateHmac(hmac)) {
    return { props: { ...props, error: true } };
  }

  const [items, total] = await Promise.all([
    order.getOrderItems(),
    order.getOrderTotal(),
  ]);

  // const items = (await order.getOrderItems());

  return {
    props: {
      ...props,
      ...pick(order, ["address", "status", "externalId"]),
      total,
      items: items.map((item) =>
        pick(item, [
          "title",
          "title_en",
          "brief",
          "brief_en",
          "capacity",
          "capacity_en",
          "unit",
          "variant",
          "qty",
          "price",
          "total",
        ])
      ),
    },
  };
}

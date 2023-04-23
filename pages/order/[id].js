import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { orderByIm } from "../../lib/backend/cdek";
import { Order } from "../../lib/backend/sequelize";
import { formatRU } from "../../lib/helpers/date";
import first from "lodash/first";
import get from "lodash/get";
import pick from "lodash/pick";
import A from "@mui/material/Link";
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
import Grid from "@mui/material/Grid";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import { orderStatusesKeys } from "../../constants";

export default function ViewOrder({
  error,
  address,
  name,
  status,
  externalId,
  total,
  delivery,
  items,
  cdek,
}) {
  console.log(cdek);
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
              <Typography fontWeight="bold">{t("order-status")}</Typography>
              <Typography paragraph>
                {t(`order-status-${status}`)}{" "}
                {cdek && status === orderStatusesKeys.shipping ? (
                  <CdekStatus cdek={cdek} />
                ) : null}
              </Typography>
              <Typography fontWeight="bold">{t("order-address")}</Typography>
              <Typography paragraph>
                «{name}» по адресу {address}
              </Typography>
              <Typography variant="h4" paragraph>
                {t("order-items-title")}
              </Typography>
              <TableContainer sx={{ mb: 8 }}>
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
                      <TableCell>
                        <Typography>доставка</Typography>
                        <Typography variant="h5" textTransform="uppercase">
                          СДЭК
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ verticalAlign: "bottom" }}
                      ></TableCell>
                      <TableCell align="right" sx={{ verticalAlign: "bottom" }}>
                        <Typography variant="h5">
                          <Price sum={delivery} />
                        </Typography>
                      </TableCell>
                    </TableRow>
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
              <Typography variant="h5" paragraph>
                Если у вас остались вопросы&hellip;
              </Typography>
              <Typography paragraph>
                Если у Вас остались вопросы относительно заказа или нашей
                работы, пожалуйста, позвоните или напишите нам:
              </Typography>
              <Grid container sx={{ mb: 8 }}>
                <Grid item xs={6}>
                  <A
                    href="tel:+79263853751"
                    sx={{
                      display: "flex",
                      gap: 2,
                    }}
                  >
                    <LocalPhoneIcon fontSize="large" />
                    <WhatsAppIcon fontSize="large" />
                    <Typography component="span" variant="h5" fontWeight="bold">
                      +7 926 385 3751
                    </Typography>
                  </A>
                </Grid>
                <Grid item xs={6}>
                  <A
                    href="mailto:office@deluxspa.ru"
                    sx={{
                      display: "flex",
                      gap: 2,
                    }}
                  >
                    <AlternateEmailIcon fontSize="large" />
                    <Typography component="span" variant="h5" fontWeight="bold">
                      office@deluxspa.ru
                    </Typography>
                  </A>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Container>
    </Layout>
  );
}

function CdekStatus({ cdek }) {
  const { date_time, name } = first(cdek.statuses);
  const date = formatRU(new Date(date_time));

  return (
    <Typography
      component="span"
      sx={{
        textTransform: "lowercase",
      }}
    >
      (
      <A
        href={`https://www.cdek.ru/ru/tracking?order_id=${cdek.cdek_number}`}
        target="_blank"
      >
        {name} {date}
      </A>
      )
    </Typography>
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

  const [items, cdek] = await Promise.all([
    order.getOrderItems(),
    order.cdekOrderId ? orderByIm(order.cdekOrderId) : Promise.resolve(null),
  ]);

  // FIXME
  // res.status(200).json({
  //   orders: orders.map((order) => ({
  //     ...order.viewData,
  //     items: order.OrderItems.map((item) => item.viewData),
  //   })),
  // });
  return {
    props: {
      ...props,
      ...pick(order, [
        "address",
        "name",
        "total",
        "delivery",
        "status",
        "externalId",
      ]),
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
      cdek: cdek
        ? pick(get(cdek, "entity"), ["cdek_number", "statuses"])
        : null,
    },
  };
}

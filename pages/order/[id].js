import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import sequelize from "../../lib/backend/sequelize";
import Layout from "../../components/layout";
import Container from "@mui/material/Container";

export default function Order({ externalId, status }) {
  const { t } = useTranslation();

  // FIXME title
  // TODO вы можете отслеживать заказ при помощи бота
  // TODO вы можете оставить нам свою электронную почту, чтобы получать уведомления
  return (
    <Layout>
      <Container>
        Инфа по заказу №{externalId} — {status}
      </Container>
    </Layout>
  );
}

export async function getServerSideProps({ locale, params: { id } }) {
  const db = await sequelize;
  const order = await db.models.Order.findOne({ where: { key: id } });

  return {
    props: {
      id,
      status: order.status,
      externalId: order.externalId,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

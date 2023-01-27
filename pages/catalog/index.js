import { useMemo } from "react";
import Layout from "../../components/layout";
import Items from "../../components/items";
import Submenu from "../../components/submenu";
import { catalogItems } from "../../constants";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import property from "lodash/property";

export default function CatalogRoot() {
  const { t } = useTranslation();
  const allIds = useMemo(() => catalogItems.map(property("id")), []);

  return (
    <Layout title={t("page-title-catalog")}>
      <>
        <Submenu />
        <Items items={allIds} />
      </>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

import { useMemo } from "react";
import Layout from "../../components/layout";
import Items from "../../components/items";
import Submenu from "../../components/submenu";
import { catalogItems } from "../../constants";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import property from "lodash/property";

export default function CatalogRoot() {
  const allIds = useMemo(() => catalogItems.map(property("id")), []);

  return (
    <Layout>
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

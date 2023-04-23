import { useMemo } from "react";
import Items from "../../components/items";
import Submenu from "../../components/submenu";
import { catalogItems } from "../../constants";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import property from "lodash/property";

export default function CatalogRoot() {
  const allIds = useMemo(() => catalogItems.map(property("id")), []);

  return (
    <>
      <Submenu />
      <Items items={allIds} />
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      titleKey: "page-title-catalog",
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

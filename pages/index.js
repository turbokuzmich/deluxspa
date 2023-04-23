import Box from "@mui/material/Box";
import Carousel from "../components/carousel";
import CategoriesPane from "../components/categories";
import Advantages from "../components/advantages";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// import Brands from "../components/brands";

export default function Home() {
  return (
    <>
      <Carousel />
      <Advantages />
      <CategoriesPane />
    </>
  );
}
// <Brands />

export async function getStaticProps({ locale }) {
  return {
    props: {
      titleKey: "page-title-index",
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

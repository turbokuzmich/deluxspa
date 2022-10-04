import Box from "@mui/material/Box";
import Layout from "../components/layout";
import Carousel from "../components/carousel";
import CategoriesPane from "../components/categories";
import Advantages from "../components/advantages";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// import Brands from "../components/brands";

export default function Home() {
  return (
    <Layout>
      <Carousel />
      <Advantages />
      <CategoriesPane />
    </Layout>
  );
}
// <Brands />

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

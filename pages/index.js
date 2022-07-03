import Layout from "../components/layout";
import Carousel from "../components/carousel";
import CategoriesPane from "../components/categories";
import Advantages from "../components/advantages";
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

import Layout from "../components/layout";
import Carousel from "../components/carousel";
import CategoriesPane from "../components/categories";
import Brands from "../components/brands";

export default function Home() {
  return (
    <Layout>
      <Carousel />
      <CategoriesPane />
      <Brands />
    </Layout>
  );
}

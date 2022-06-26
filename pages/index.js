import Layout from "../components/layout";
import Carousel from "../components/carousel";
import CategoriesPane from "../components/categories";

export default function Home() {
  return (
    <Layout>
      <Carousel />
      <CategoriesPane />
    </Layout>
  );
}

import { useMemo, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import Image from "../../../components/image";
import Submenu from "../../../components/submenu";
import Typography from "@mui/material/Typography";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import A from "@mui/material/Link";
import Link from "next/link";
import get from "lodash/get";
import Price from "../../../components/price";
import { compositionItems, consumptionTitles } from "../../../constants";
import {
  getItemById,
  getItemCategoriesById,
  getItemAuxiliaryItemsById,
} from "../../../helpers/catalog";

export default function Item() {
  const {
    query: { id },
  } = useRouter();

  const item = useMemo(() => getItemById(id), [id]);
  const categories = useMemo(() => getItemCategoriesById(id).slice(0, 3), [id]);

  return (
    <Layout>
      <>
        <Submenu />
        {item ? (
          <Container
            sx={{
              mb: 4,
            }}
          >
            <Box
              sx={{
                gap: 6,
                display: "flex",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                <Image src={item.image} sx={{ maxWidth: "100%" }} />
              </Box>
              <Box
                sx={{
                  width: "50%",
                  flexShrink: 0,
                  flexGrow: 0,
                  pt: 4,
                }}
              >
                <Typography variant="h4">{item.title}</Typography>
                <Typography variant="h6" paragraph>
                  {item.brief}
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    gap: 2,
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">
                    <Price sum={item.price} />
                  </Typography>
                  <Link href="/map" passHref>
                    <Button
                      startIcon={<ShoppingCartIcon />}
                      variant="outlined"
                      size="large"
                    >
                      Где можно купить?
                    </Button>
                  </Link>
                </Typography>
                <Categories categories={categories} />
                <Consumption item={item} />
                <Composition item={item} />
                <Description item={item} />
                <Auxiliary item={item} />
              </Box>
            </Box>
          </Container>
        ) : null}
      </>
    </Layout>
  );
}

function Auxiliary({ item }) {
  const auxiliary = useMemo(() => getItemAuxiliaryItemsById(item.id), [item]);

  return (
    <>
      <Typography variant="h6">Похожие товары</Typography>
      <Box
        sx={{
          mt: 1,
          gap: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {auxiliary.map((item) => (
          <Link key={item.id} href={`/catalog/item/${item.id}`} passHref>
            <A
              underline="none"
              sx={{
                gap: 2,
                display: "flex",
              }}
            >
              <Box
                sx={{
                  width: 100,
                  flexGrow: 0,
                  flexShrink: 0,
                  display: "flex",
                }}
              >
                <Image src={item.image} sx={{ maxWidth: "100%" }} />
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    flexGrow: 0,
                    flexShrink: 0,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    flexGrow: 1,
                    flexShrink: 0,
                  }}
                >
                  {item.brief}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    flexGrow: 0,
                    flexShrink: 0,
                  }}
                >
                  <Price sum={item.price} />
                </Typography>
              </Box>
            </A>
          </Link>
        ))}
      </Box>
    </>
  );
}

function Description({ item }) {
  const lines = get(item, "description", []);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const onOpen = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setIsCollapsed(false);
    },
    [setIsCollapsed]
  );

  if (lines.length === 1) {
    return (
      <>
        <Typography variant="h6">Описание</Typography>
        <Typography dangerouslySetInnerHTML={{ __html: lines[0] }} paragraph />
      </>
    );
  }

  if (isCollapsed) {
    return (
      <>
        <Typography variant="h6">Описание</Typography>
        <Typography paragraph>
          <Typography
            component="span"
            dangerouslySetInnerHTML={{ __html: lines[0] }}
          />{" "}
          <A href={`/catalog/item/${item.id}`} onClick={onOpen}>
            Подробнее
          </A>
        </Typography>
      </>
    );
  }

  return (
    <>
      <Typography variant="h6">Описание</Typography>
      {lines.map((line, index) => (
        <Typography
          key={`item-description-${index}`}
          dangerouslySetInnerHTML={{ __html: line }}
          paragraph
        />
      ))}
    </>
  );
}

function Categories({ categories = [] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">
        {categories.length === 1 ? "Категория товара" : "Категории товара"}
      </Typography>
      <Typography component="ul" paragraph>
        {categories.map((category) => (
          <Typography key={category.id} component="li">
            <Link href={`/catalog/category/${category.id}`} passHref>
              <A>{category.title}</A>
            </Link>
          </Typography>
        ))}
      </Typography>
    </>
  );
}

function Consumption({ item: { consumption } }) {
  if (!consumption) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">Расход на процедуру</Typography>
      <Typography component="ul" paragraph>
        {["common", "back"].map((id) => (
          <Typography key={id} component="li">
            {consumptionTitles[id]}: {consumption[id]}
          </Typography>
        ))}
      </Typography>
    </>
  );
}

function Composition({ item: { composition } }) {
  if (!composition || !Array.isArray(composition) || composition.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">Состав</Typography>
      <Typography component="ul" paragraph>
        {composition.map((id) => (
          <Typography key={id} component="li">
            {compositionItems[id].title}
          </Typography>
        ))}
      </Typography>
    </>
  );
}

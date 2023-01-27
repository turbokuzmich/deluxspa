import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import cartSlice, { getCartItems } from "../../store/slices/cart";
import { useSelector } from "react-redux";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getItemById, formatCapacity } from "../../lib/helpers/catalog";

export default function Cart() {
  const { t } = useTranslation();
  const items = useSelector(getCartItems);

  return (
    <Layout>
      <Container>
        <Box sx={{ pt: 8 }}>
          <Typography variant="h3" paragraph>
            Корзина
          </Typography>
          <Box
            sx={{
              gap: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {items.map((item) => {
              const catalogItem = getItemById(item.itemId);
              const [capacity, unitKey] = formatCapacity(
                item.variantId,
                catalogItem.unit
              );

              return (
                <Box key={`${item.itemId}-${item.variantId}`}>
                  <Typography textTransform="uppercase" variant="body2">
                    {t(catalogItem.brief)}
                  </Typography>
                  <Typography textTransform="uppercase" variant="h6">
                    {t(catalogItem.title)} {capacity} {t(unitKey)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>
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

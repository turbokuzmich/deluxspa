import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import Image from "../../components/image";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import NumbericStepper from "../../components/numericstepper";
import Price from "../../components/price";
import A from "@mui/material/Link";
import Link from "next/link";
import cartSlice, { getCartItems, getItemTotal } from "../../store/slices/cart";
import { useSelector } from "react-redux";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getItemById, formatCapacity } from "../../lib/helpers/catalog";
import { useMemo } from "react";
import { useDispatch } from "react-redux";

export default function Cart() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const items = useSelector(getCartItems);

  const onChanges = useMemo(
    () =>
      items.map(({ itemId, variantId, qty }) => ({
        inc() {
          dispatch(
            cartSlice.actions.changeItem({
              id: itemId,
              variant: variantId,
              qty: qty + 1,
            })
          );
        },
        dec() {
          if (qty > 1) {
            dispatch(
              cartSlice.actions.changeItem({
                id: itemId,
                variant: variantId,
                qty: qty - 1,
              })
            );
          }
        },
      })),
    [items, dispatch]
  );

  return (
    <Layout>
      <Container>
        <Box sx={{ pt: 8 }}>
          <Typography variant="h3" paragraph>
            Оформление покупки
          </Typography>
          <Card elevation={0} square>
            <CardContent>
              <Typography variant="h4" paragraph>
                Товары
              </Typography>
              <Box
                sx={{
                  gap: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {items.map((item, index) => {
                  const catalogItem = getItemById(item.itemId);
                  const variant = catalogItem.variants.byId[item.variantId];
                  const [capacity, unitKey] = formatCapacity(
                    item.variantId,
                    catalogItem.unit
                  );

                  return (
                    <Box
                      key={`${item.itemId}-${item.variantId}`}
                      sx={{
                        gap: 4,
                        display: "flex",
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: 100,
                          flexGrow: 0,
                          flexShrink: 0,
                        }}
                      >
                        <Link href={`/catalog/item/${catalogItem.id}`} passHref>
                          <A sx={{ display: "block" }}>
                            <Image
                              src={variant.image}
                              alt={catalogItem.title}
                              sx={{
                                maxWidth: "100%",
                                userSelect: "none",
                                display: "block",
                              }}
                            />
                          </A>
                        </Link>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexGrow: 1,
                          flexShrink: 1,
                          flexDirection: "column",
                          pt: 1,
                          pb: 1,
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography textTransform="uppercase" variant="body2">
                            {t(catalogItem.brief)}
                          </Typography>
                          <Typography textTransform="uppercase" variant="h6">
                            <Link
                              href={`/catalog/item/${catalogItem.id}`}
                              passHref
                            >
                              <A>{t(catalogItem.title)}</A>
                            </Link>
                          </Typography>
                        </Box>
                        <Box>
                          <Typography>
                            {capacity} {t(unitKey)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <NumbericStepper
                          value={item.qty}
                          inc={onChanges[index].inc}
                          dec={onChanges[index].dec}
                        />
                      </Box>
                      <Box>
                        <Price sum={getItemTotal(item)} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
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

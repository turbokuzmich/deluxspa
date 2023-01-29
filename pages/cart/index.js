import Number from "../../components/number";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import Image from "../../components/image";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import NumbericStepper from "../../components/numericstepper";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Price from "../../components/price";
import MapLoader from "../../components/maploader";
import A from "@mui/material/Link";
import Link from "next/link";
import decline from "../../lib/helpers/declension";
import identity from "lodash/identity";
import { useSelector } from "react-redux";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getItemById, formatCapacity } from "../../lib/helpers/catalog";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import deliverySlice, {
  getDeliveryAddress,
  getDeliveryAddressSuggestions,
} from "../../store/slices/delivery";
import cartSlice, {
  CartState,
  getCartState,
  getCartItems,
  getCartItemsCount,
  getItemTotal,
  getCartSubtotal,
} from "../../store/slices/cart";

export default function Cart() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const items = useSelector(getCartItems);
  const count = useSelector(getCartItemsCount);
  const subtotal = useSelector(getCartSubtotal);
  const state = useSelector(getCartState);
  const address = useSelector(getDeliveryAddress);
  const addressSuggestions = useSelector(getDeliveryAddressSuggestions);

  const onChanges = useMemo(
    () =>
      items.map(({ itemId, variantId, qty }) => ({
        del() {
          dispatch(
            cartSlice.actions.changeItem({
              id: itemId,
              variant: variantId,
              qty: 0,
            })
          );
        },
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

  const toItems = useCallback(
    () => dispatch(cartSlice.actions.toItems()),
    [dispatch]
  );

  const toDelivery = useCallback(
    () => dispatch(cartSlice.actions.toDelivery()),
    [dispatch]
  );

  const onMapsReady = useCallback(
    () => dispatch(deliverySlice.actions.apiLoaded()),
    [dispatch]
  );

  const onAddressInputChange = useCallback(
    (_, newInput) =>
      dispatch(deliverySlice.actions.changeAddressInput(newInput)),
    [dispatch]
  );

  const onAddressSelected = useCallback(
    (_, option) =>
      dispatch(deliverySlice.actions.setAddress(option ? option.value : null)),
    [dispatch]
  );

  const isOptionEqualToValue = useCallback(
    ({ value }, address) => value === address,
    []
  );

  if ([CartState.initial, CartState.fetching].includes(state)) {
    return (
      <Layout>
        <Container>
          <Box sx={{ pt: 8 }}>
            <Typography variant="h3" paragraph>
              Корзина
            </Typography>
            <Typography>
              Через мгновение вы сможете оформить ваши покупки
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <Container>
          <Box sx={{ pt: 8 }}>
            <Typography variant="h3" paragraph>
              Корзина пуста
            </Typography>
            <Typography>
              <Link href="/catalog" passHref>
                <A>Перейти к покупкам</A>
              </Link>
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <>
      <MapLoader onReady={onMapsReady} />
      <Layout>
        <Container>
          <Box sx={{ pt: 8 }}>
            <Typography variant="h3" paragraph>
              Оформление покупки
            </Typography>
            {state === CartState.fetched ? (
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
                            <Link
                              href={`/catalog/item/${catalogItem.id}`}
                              passHref
                            >
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
                              <Typography
                                textTransform="uppercase"
                                variant="body2"
                              >
                                {t(catalogItem.brief)}
                              </Typography>
                              <Typography
                                textTransform="uppercase"
                                variant="h6"
                              >
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "flex-start",
                            }}
                          >
                            <NumbericStepper
                              value={item.qty}
                              inc={onChanges[index].inc}
                              dec={onChanges[index].dec}
                            />
                            <Button
                              onClick={onChanges[index].del}
                              variant="outlined"
                              color="secondary"
                              size="medium"
                              sx={{
                                ml: 2,
                                pl: 0,
                                pr: 0,
                                width: 42,
                                minWidth: 0,
                              }}
                            >
                              <DeleteIcon />
                            </Button>
                            <Typography
                              component="div"
                              variant="h6"
                              textAlign="right"
                              sx={{
                                minWidth: 120,
                              }}
                            >
                              <Price sum={getItemTotal(item)} />
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
                <CardActions
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Button size="large" variant="contained" onClick={toDelivery}>
                    Оформить доставку
                  </Button>
                  <Typography variant="h5">
                    Итого: <Price sum={subtotal} />
                  </Typography>
                </CardActions>
              </Card>
            ) : (
              <Card elevation={0} sx={{ mb: 1 }} square>
                <CardContent
                  sx={{
                    gap: 2,
                    display: "flex",
                    alignItems: "center",
                    ":last-child": {
                      pb: 2,
                    },
                  }}
                >
                  <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Товары
                  </Typography>
                  <Typography variant="h6">
                    <Number value={count} />{" "}
                    {decline(count, ["позиция", "позиции", "позиций"])} на сумму{" "}
                    <Price sum={subtotal} />
                  </Typography>
                  <Button variant="contained" size="medium" onClick={toItems}>
                    Изменить
                  </Button>
                </CardContent>
              </Card>
            )}
            {state === CartState.delivery ? (
              <Card elevation={0} square>
                <CardContent>
                  <Typography variant="h4" paragraph>
                    Доставка
                  </Typography>
                  <Autocomplete
                    disablePortal
                    autoComplete
                    value={address}
                    filterOptions={identity}
                    onInputChange={onAddressInputChange}
                    onChange={onAddressSelected}
                    options={addressSuggestions}
                    isOptionEqualToValue={isOptionEqualToValue}
                    renderOption={(props, option) => (
                      <li {...props} key={option.value}>
                        {option.label}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Укажите адрес доставки"
                        fullWidth
                      />
                    )}
                  />
                </CardContent>
              </Card>
            ) : null}
          </Box>
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

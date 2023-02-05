import * as yup from "yup";
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
import { Formik, Form, Field, useField, useFormikContext } from "formik";
import { TextField as TextInput } from "formik-mui";
import { PatternFormat } from "react-number-format";
import { useSelector } from "react-redux";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getItemById, formatCapacity } from "../../lib/helpers/catalog";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { phoneFormat } from "../../constants";
import { useRouter } from "next/router";
import deliverySlice, {
  getDeliveryAddress,
  getDeliveryFormValues,
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
  const { locale } = useRouter();
  const dispatch = useDispatch();
  const items = useSelector(getCartItems);
  const count = useSelector(getCartItemsCount);
  const subtotal = useSelector(getCartSubtotal);
  const state = useSelector(getCartState);
  const address = useSelector(getDeliveryAddress);
  const addressSuggestions = useSelector(getDeliveryAddressSuggestions);
  const formValues = useSelector(getDeliveryFormValues);
  const phoneFieldRef = useRef(null);

  const deliveryValidationSchema = useMemo(
    () =>
      yup.object().shape({
        phone: yup
          .string()
          .trim()
          .required(t("cart-page-phone-number-empty"))
          .matches(/^\d{10}$/, t("cart-page-phone-number-incorrect")),
        email: yup.string().email(t("cart-page-email-incorrect")),
      }),
    [t]
  );

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

  const toPayment = useCallback(
    (info) => {
      dispatch(deliverySlice.actions.setContactInfo(info));
      dispatch(cartSlice.actions.toPayment());
    },
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

  useEffect(() => {
    if (state === CartState.delivery && phoneFieldRef.current) {
      phoneFieldRef.current.focus();
    }
  }, [state]);

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
                <A>{t("cart-page-back-to-catalog")}</A>
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Typography variant="h3" paragraph>
                {t("cart-page-title")}
              </Typography>
              <Typography variant="h5">
                <Link href="/catalog" passHref>
                  <A>{t("cart-page-back-to-catalog")}</A>
                </Link>
              </Typography>
            </Box>
            {state === CartState.fetched ? (
              <Card elevation={0} square>
                <CardContent>
                  <Typography variant="h4" paragraph>
                    {t("cart-page-items-title")}
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
                    {t("cart-page-button-shipping")}
                  </Button>
                  <Typography variant="h5">
                    {t("cart-page-subtotal")}: <Price sum={subtotal} />
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
                    {t("cart-page-items-title")}
                  </Typography>
                  <Typography variant="h6">
                    <Number value={count} />{" "}
                    {decline(
                      count,
                      [
                        t("cart-page-items-1"),
                        t("cart-page-items-2"),
                        t("cart-page-items-5"),
                      ],
                      locale
                    )}{" "}
                    {t("cart-page-for")} <Price sum={subtotal} />
                  </Typography>
                  <Button variant="contained" size="medium" onClick={toItems}>
                    {t("cart-page-button-change")}
                  </Button>
                </CardContent>
              </Card>
            )}
            {state === CartState.delivery ? (
              <Formik
                initialValues={formValues}
                onSubmit={toPayment}
                validationSchema={deliveryValidationSchema}
                enableReinitialize
                validateOnMount
              >
                <Card elevation={0} square>
                  <CardContent>
                    <Typography variant="h4" paragraph>
                      {t("cart-page-shipping-title")}
                    </Typography>
                    <Form>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <PhoneInput inputRef={phoneFieldRef} />
                        <Field
                          component={TextInput}
                          label={t("cart-page-email")}
                          autoComplete="off"
                          name="email"
                          fullWidth
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
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
                              label={t("cart-page-address")}
                              fullWidth
                            />
                          )}
                        />
                      </Box>
                      <Field
                        component={TextInput}
                        label={t("cart-page-comment")}
                        autoComplete="off"
                        name="comment"
                        rows={4}
                        multiline
                        fullWidth
                      />
                    </Form>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <ToPaymentButton />
                  </CardActions>
                </Card>
              </Formik>
            ) : null}
            {state === CartState.payment ? (
              <>
                <Card elevation={0} square>
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
                      Доставка
                    </Typography>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={toDelivery}
                    >
                      Изменить
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </Box>
        </Container>
      </Layout>
    </>
  );
}

function ToPaymentButton() {
  const { t } = useTranslation();
  const { isValid, submitForm } = useFormikContext();

  return (
    <Button
      size="large"
      variant="contained"
      disabled={!isValid}
      onClick={submitForm}
    >
      {t("cart-page-button-complete-order")}
    </Button>
  );
}

function PhoneInputBase({ inputRef, ...props }) {
  const { t } = useTranslation();
  const [{ name }, { error, touched }] = useField("phone");

  return (
    <TextField
      {...props}
      error={touched && Boolean(error)}
      helperText={touched ? error : undefined}
      inputRef={inputRef}
      label={t("cart-page-phone")}
      autoComplete="off"
      name={name}
      fullWidth
      required
    />
  );
}

function PhoneInput({ inputRef }) {
  const [{ value, onBlur }, _, { setValue }] = useField("phone");

  const onValueChange = useCallback(({ value }) => setValue(value), [setValue]);

  const renderInput = useCallback(
    (props) => <PhoneInputBase inputRef={inputRef} {...props} />,
    [inputRef]
  );

  return (
    <PatternFormat
      mask="_"
      value={value}
      onBlur={onBlur}
      format={phoneFormat}
      customInput={renderInput}
      onValueChange={onValueChange}
      allowEmptyFormatting
      valueIsNumericString
    />
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

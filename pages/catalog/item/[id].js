import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import Image from "../../../components/image";
import Submenu from "../../../components/submenu";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HandshakeIcon from "@mui/icons-material/Handshake";
import Number from "../../../components/number";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import NumbericStepper from "../../../components/numericstepper";
import A from "@mui/material/Link";
import Link from "next/link";
import get from "lodash/get";
import Price from "../../../components/price";
import { compositionItems, consumptionTitles } from "../../../constants";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useDispatch } from "react-redux";
import cartSlice from "../../../store/slices/cart";
import {
  getItemById,
  formatCapacity,
  getItemCategoriesById,
  getItemFirstPreviewImage,
  getItemAuxiliaryItemsIdsById,
} from "../../../lib/helpers/catalog";

export default function Item({ id, auxiliaryIds }) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const dispatch = useDispatch();

  const item = useMemo(() => getItemById(id), [id]);
  const categories = useMemo(() => getItemCategoriesById(id).slice(0, 3), [id]);
  const auxiliary = useMemo(
    () => auxiliaryIds.map(getItemById),
    [auxiliaryIds]
  );

  const [variantIndex, setVariantIndex] = useState(0);
  const variant = item.variants.byId[item.variants.list[variantIndex]];

  const [qtys, setQtys] = useState(() =>
    item.variants.list.reduce(
      (qtys, variant) => ({ ...qtys, [variant]: 1 }),
      {}
    )
  );

  const onQtyChanges = useMemo(
    () =>
      item.variants.list.reduce(
        (callbacks, variant) => ({
          ...callbacks,
          [variant]: {
            inc: () => setQtys({ ...qtys, [variant]: qtys[variant] + 1 }),
            dec: () =>
              qtys[variant] > 1
                ? setQtys({ ...qtys, [variant]: qtys[variant] - 1 })
                : undefined,
          },
        }),
        {}
      ),
    [qtys, item, setQtys]
  );

  const onVariantChanges = useMemo(
    () =>
      item.variants.list.reduce(
        (callbacks, variant, index) => ({
          ...callbacks,
          [variant]: () => setVariantIndex(index),
        }),
        {}
      ),
    [item, setVariantIndex]
  );

  const onBuys = useMemo(
    () =>
      item.variants.list.reduce(
        (callbacks, variant) => ({
          ...callbacks,
          [variant]: () => {
            dispatch(
              cartSlice.actions.changeItem({
                id,
                qty: qtys[variant],
                variant,
                append: true,
              })
            );
          },
        }),
        {}
      ),
    [id, qtys, item, dispatch]
  );

  const onGoToMap = useCallback(() => push(`/map`), [push]);

  return (
    <Layout title={`${item.title} (${t(item.brief)})`}>
      <>
        <Submenu />
        <Container
          sx={{
            mb: 4,
            gap: {
              md: 6,
            },
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <Box
            sx={{
              width: {
                md: "50%",
              },
              flexShrink: 0,
              flexGrow: 0,
              mt: 4,
              display: "flex",
              position: "relative",
              justifyContent: "center",
              alignItems: "flex-start",
              fontSize: "120px",
            }}
          >
            <Image
              src={variant.image}
              alt={item.title}
              sx={{ maxWidth: "100%", userSelect: "none" }}
            />
            <ButtonGroup
              color="secondary"
              variant="contained"
              orientation="vertical"
              sx={(theme) => ({
                position: "absolute",
                top: theme.spacing(2),
                right: theme.spacing(2),
              })}
            >
              {item.variants.list.map((variant, index) => {
                const { unit } = item;
                const { volume } = item.variants.byId[variant];
                const [capacity, unitKey] = formatCapacity(volume, unit);

                return (
                  <Button
                    key={variant}
                    size="large"
                    onClick={onVariantChanges[variant]}
                    color={index === variantIndex ? "primary" : "secondary"}
                  >
                    <Number value={capacity} />
                    &nbsp;{t(unitKey)}
                  </Button>
                );
              })}
            </ButtonGroup>
          </Box>
          <Box
            sx={{
              width: {
                md: "50%",
              },
              flexShrink: 0,
              flexGrow: 0,
              pt: {
                xs: 2,
                md: 4,
              },
            }}
          >
            <Typography variant="h6">{t(item.brief)}</Typography>
            <Typography
              variant="h4"
              sx={{ textTransform: "uppercase" }}
              paragraph
            >
              {item.title}
            </Typography>
            <Typography component="div" paragraph>
              <Table>
                <TableBody>
                  {item.variants.list.map((variant) => {
                    const { unit } = item;
                    const { price, volume } = item.variants.byId[variant];
                    const [capacity, unitKey] = formatCapacity(volume, unit);

                    return (
                      <TableRow key={variant}>
                        <TableCell component="th" width="100%">
                          <Typography>
                            <Number value={capacity} /> {t(unitKey)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>
                            <Price sum={price} />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <NumbericStepper
                            value={qtys[variant]}
                            dec={onQtyChanges[variant].dec}
                            inc={onQtyChanges[variant].inc}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            startIcon={<ShoppingCartIcon />}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            onClick={onBuys[variant]}
                          >
                            Купить
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Typography>
            <Typography component="div" paragraph>
              <Tooltip
                title="Узнайте, где ближайших магазин"
                placement="right"
                arrow
              >
                <Button
                  onClick={onGoToMap}
                  startIcon={<HandshakeIcon />}
                  variant="outlined"
                  size="large"
                >
                  Купить у нашего партнера
                </Button>
              </Tooltip>
            </Typography>
            <Categories categories={categories} />
            <Consumption item={item} />
            <Composition item={item} />
            <Description item={item} />
            <Auxiliary auxiliary={auxiliary} />
          </Box>
        </Container>
      </>
    </Layout>
  );
}

function Auxiliary({ auxiliary }) {
  const { t } = useTranslation();

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
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  alt={item.title}
                  src={getItemFirstPreviewImage(item.id)}
                  sx={{ maxWidth: "100%" }}
                />
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  flexShrink: 1,
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
                  {t(item.brief)}
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
  const { t } = useTranslation();

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">
        {categories.length === 1
          ? t("catalog-category")
          : t("catalog-categories")}
      </Typography>
      <Typography component="ul" paragraph>
        {categories.map((category) => (
          <Typography key={category.id} component="li">
            <Link href={`/catalog/category/${category.id}`} passHref>
              <A>{t(category.title)}</A>
            </Link>
          </Typography>
        ))}
      </Typography>
    </>
  );
}

function Consumption({ item: { consumption } }) {
  const { t } = useTranslation();

  if (!consumption) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">{t("catalog-cost-per-procedure")}</Typography>
      <Typography component="ul" paragraph>
        {["common", "back"].map((id) => (
          <Typography key={id} component="li">
            {t(consumptionTitles[id])}: {consumption[id]}
          </Typography>
        ))}
      </Typography>
    </>
  );
}

function Composition({ item }) {
  const { t } = useTranslation();
  const composition = get(item, "composition", []);

  const { push } = useRouter();

  const onClick = useCallback(
    (event) => {
      event.preventDefault();

      push(event.target.getAttribute("href"));
    },
    [push]
  );

  if (composition.length === 0) {
    return;
  }

  // {compositionItems[id].brief ? (
  return (
    <>
      <Typography variant="h6">{t("catalog-composition")}</Typography>
      <Typography component="ul" paragraph>
        {composition.map((id) => (
          <Typography key={id} component="li">
            {false ? (
              <Tooltip
                title={compositionItems[id].brief}
                placement="right"
                arrow
              >
                <A href={`/ingredients/${id}`} onClick={onClick}>
                  {compositionItems[id].title}
                </A>
              </Tooltip>
            ) : (
              compositionItems[id].title
            )}
          </Typography>
        ))}
      </Typography>
    </>
  );
}

export async function getServerSideProps({ locale, params: { id } }) {
  return {
    props: {
      id,
      auxiliaryIds: getItemAuxiliaryItemsIdsById(id),
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

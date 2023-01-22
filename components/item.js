import { useMemo } from "react";
import Box from "@mui/material/Box";
import A from "@mui/material/Link";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import Image from "./image";
import Number from "./number";
import { catalogItems, capacities } from "../constants";
import Price from "./price";
import { useTranslation } from "next-i18next";
import { getItemFirstPreviewImage, formatCapacity } from "../lib/helpers/catalog";
import first from "lodash/first";
import last from "lodash/last";

export default function Item({ id }) {
  const { t } = useTranslation();
  const item = useMemo(() => catalogItems.find((item) => item.id === id), []);

  return (
    <Link href={`/catalog/item/${item.id}`} passHref>
      <A
        underline="none"
        sx={{
          p: 4,
          color: "custom.link",
          width: {
            xs: "100%",
            md: 362,
          },
          flexShrink: 0,
          position: "relative",
          backgroundColor: "common.white",
          "& .title::after, & .title::before": {
            bottom: "6px",
            content: '""',
            height: "2px",
            position: "absolute",
            transition: "left .2s ease-out, right .2s ease-out",
            backgroundColor: "custom.eco",
          },
          "& .title::before": {
            left: "50%",
            right: "50%",
          },
          "& .title::after": {
            left: "50%",
            right: "50%",
          },
          "&:hover": {
            color: "text.primary",
          },
          "&:hover .title::before": {
            left: 0,
          },
          "&:hover .title::after": {
            right: 0,
          },
        }}
      >
        <Box
          sx={{
            pt: 1,
            pb: 1,
            pl: 2,
            pr: 2,
            position: "absolute",
            backgroundColor: "custom.attention",
            display: "none",
          }}
        >
          <Typography
            color="info.contrastText"
            sx={{ textTransform: "uppercase", fontWeight: "bold" }}
          >
            похудение
          </Typography>
        </Box>
        <Box
          sx={{
            mb: 4,
            height: 280,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            fontSize: "60px",
          }}
        >
          <Image
            className="image"
            src={getItemFirstPreviewImage(item.id)}
            alt={item.title}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </Box>
        <Typography
          className="title"
          variant="h6"
          sx={{
            pb: 1,
            textTransform: "uppercase",
            position: "relative",
          }}
        >
          {item.title}
        </Typography>
        <Typography variant="subtitle2">{t(item.brief)}</Typography>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            color="text.primary"
            sx={{ fontWeight: "bold" }}
          >
            {item.variants.list.length > 1 ? (
              <>
                {t("price_from")}{" "}
                <Price sum={item.variants.byId[item.variants.list[0]].price} />
              </>
            ) : (
              <Price sum={item.variants.byId[item.variants.list[0]].price} />
            )}
          </Typography>
          <Typography align="right" variant="subtitle2">
            <Capacity item={item} />
          </Typography>
        </Box>
      </A>
    </Link>
  );
}

function Capacity({ item }) {
  const { t } = useTranslation();

  const [firstCapacity, firstUnit] = formatCapacity(
    first(item.variants.list),
    item.unit
  );

  if (item.variants.list.length === 1) {
    return (
      <>
        <Number value={firstCapacity} /> {t(firstUnit)}
      </>
    );
  }

  const [lastCapacity, lastUnit] = formatCapacity(
    last(item.variants.list),
    item.unit
  );

  return (
    <>
      <Number value={firstCapacity} /> {t(firstUnit)} –{" "}
      <Number value={lastCapacity} /> {t(lastUnit)}
    </>
  );
}

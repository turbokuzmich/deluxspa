import { useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import { isAPILoaded } from "../../store/slices/geo";
import { map as retailers } from "../../constants";
import { useTheme } from "@mui/material/styles";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

export default function DeluxSpaMap() {
  const { t } = useTranslation();

  const isReady = useSelector(isAPILoaded);

  const {
    palette: {
      custom: { attention },
    },
  } = useTheme();

  const mapsContainerRef = useRef();
  const map = useRef();

  const onApiReady = useCallback(() => {
    if (map.current) {
      return;
    }

    map.current = new ymaps.Map(mapsContainerRef.current, {
      center: [55.76, 37.64],
      zoom: 5,
      controls: ["smallMapDefaultSet"],
    });

    const clusterer = new ymaps.Clusterer({
      groupByCoordinates: false,
      clusterDisableClickZoom: true,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
    });

    const retailersPlacemarks = retailers.map(
      (retailer) =>
        new ymaps.Placemark(
          [retailer.coordinates[1], retailer.coordinates[0]],
          {
            balloonContentHeader: retailer.title,
            balloonContentBody: renderRetailerBalloonBody(retailer),
          },
          {
            preset: "islands#circleIcon",
            iconColor: attention,
          }
        )
    );

    clusterer.add(retailersPlacemarks);
    map.current.geoObjects.add(clusterer);

    map.current.setBounds(clusterer.getBounds(), {
      checkZoomRange: true,
    });
  }, [attention]);

  useEffect(() => {
    if (isReady) {
      onApiReady();
    }
  }, [isReady, onApiReady]);

  return (
    <Container
      sx={{
        pt: {
          xs: 4,
          md: 8,
        },
        pb: {
          xs: 4,
          md: 8,
        },
      }}
    >
      <Typography variant="h3" sx={{ textTransform: "uppercase" }} paragraph>
        {t("menu-map")}
      </Typography>
      <Typography paragraph>{t("map-call")}</Typography>
      <Typography variant="h5" paragraph>
        <A href="tel:+74956659015">+7 (495) 665 9015</A>
      </Typography>
      <Typography paragraph>{t("map-email")}</Typography>
      <Typography variant="h5" paragraph>
        <A href="mailto:office@deluxspa.ru">office@deluxspa.ru</A>
      </Typography>
      <Typography paragraph>{t("map-partner")}</Typography>
      <Box
        ref={mapsContainerRef}
        sx={{
          height: { xs: 400, md: 600 },
        }}
      ></Box>
    </Container>
  );
}

function renderRetailerBalloonBody({
  fullAddress,
  workingTimeText,
  urls,
  phones,
}) {
  const urlsString = urls
    .map((url) => {
      if (typeof url === "string") {
        return `<a href="${url}" target="_blank">${url}</a>`;
      }

      return `<a href="mailto:${url.url}">${url.url}</a>`;
    })
    .join("<br />");

  const phonesString = phones
    .map(
      ({ number, extraNumber }) =>
        number + (extraNumber ? `, доб. ${extraNumber}` : "")
    )
    .join("<br />");

  const parts = [`<strong>${fullAddress}</strong><br />`];

  if (workingTimeText) {
    parts.push(`Время работы: ${workingTimeText}<br /><br />`);
  }

  parts.push(`${phonesString}<br /><br />`);
  parts.push(urlsString);

  return parts.join("");
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      titleKey: "page-title-map",
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

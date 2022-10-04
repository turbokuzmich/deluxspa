import { useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Script from "next/script";
import Layout from "../../components/layout";
import A from "@mui/material/Link";
import { map as retailers } from "../../constants";
import { useTheme } from "@mui/material/styles";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function DeluxSpaMap() {
  const theme = useTheme();
  const { t } = useTranslation();

  const mapsContainerRef = useRef();
  const map = useRef();

  const onApiReady = useCallback((maps) => {
    if (map.current) {
      return;
    }

    map.current = new maps.Map(mapsContainerRef.current, {
      center: [55.76, 37.64],
      zoom: 5,
      controls: ["smallMapDefaultSet"],
    });

    const clusterer = new maps.Clusterer({
      groupByCoordinates: false,
      clusterDisableClickZoom: true,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
    });

    const retailersPlacemarks = retailers.map(
      (retailer) =>
        new maps.Placemark(
          [retailer.coordinates[1], retailer.coordinates[0]],
          {
            balloonContentHeader: retailer.title,
            balloonContentBody: renderRetailerBalloonBody(retailer),
          },
          {
            preset: "islands#circleIcon",
            iconColor: theme.palette.custom.attention,
          }
        )
    );

    clusterer.add(retailersPlacemarks);
    map.current.geoObjects.add(clusterer);

    map.current.setBounds(clusterer.getBounds(), {
      checkZoomRange: true,
    });
  }, []);

  const onApiLoaded = useCallback(() => {
    ymaps.ready(onApiReady);
  }, []);

  useEffect(() => {
    if (typeof ymaps !== "undefined" && !map.current) {
      ymaps.ready(onApiReady);
    }

    return () => {
      if (map.current) {
        map.current.destroy();
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=cd000b7d-9831-4a12-8fcc-4d94421d4585&amp;lang=ru_RU"
        strategy="afterInteractive"
        onLoad={onApiLoaded}
      />
      <Layout>
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
          <Typography
            variant="h3"
            sx={{ textTransform: "uppercase" }}
            paragraph
          >
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
      </Layout>
    </>
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
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

import { useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Script from "next/script";
import Layout from "../../components/layout";
import { map as retailers } from "../../constants";
import { useTheme } from "@mui/material/styles";

export default function DeluxSpaMap() {
  const theme = useTheme();

  const mapsContainerRef = useRef();
  const map = useRef();

  const onApiReady = useCallback((maps) => {
    if (map.current) {
      return;
    }

    map.current = new maps.Map(mapsContainerRef.current, {
      center: [55.76, 37.64],
      zoom: 5,
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
            Где купить
          </Typography>
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
    .map((url) => `<a href="${url}" target="_blank">${url}</a>`)
    .join("<br />");

  const phonesString = phones
    .map(
      ({ number, extraNumber }) =>
        number + (extraNumber ? `, доб. ${extraNumber}` : "")
    )
    .join("<br />");

  return `<strong>${fullAddress}</strong><br />Время работы: ${workingTimeText}<br /><br />${phonesString}<br /><br />${urlsString}`;
}

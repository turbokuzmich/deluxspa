import { useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Script from "next/script";
import Header from "../../components/header";
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
      zoom: 11,
      controls: ["routeButtonControl"],
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
      <Header />
      <Container sx={{ pt: 8 }}>
        <Box
          ref={mapsContainerRef}
          sx={{
            height: 600,
          }}
        ></Box>
      </Container>
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

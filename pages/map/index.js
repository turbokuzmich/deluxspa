import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Script from "next/script";
import Header from "../../components/header";

export default function DeluxSpaMap() {
  const mapsContainerRef = useRef();
  const map = useRef();

  const onApiReady = useCallback((maps) => {
    if (map.current) {
      return;
    }

    map.current = new maps.Map(mapsContainerRef.current, {
      center: [55.76, 37.64],
      zoom: 7,
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
      <Header />
      <Container>
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

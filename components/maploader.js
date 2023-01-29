import { useCallback } from "react";
import Script from "next/script";

export default function MapLoader({ onReady }) {
  const onApiLoaded = useCallback(() => {
    ymaps.ready(onReady);
  }, [onReady]);

  return (
    <Script
      src="https://api-maps.yandex.ru/2.1/?apikey=cd000b7d-9831-4a12-8fcc-4d94421d4585&amp;lang=ru_RU"
      strategy="afterInteractive"
      onLoad={onApiLoaded}
    />
  );
}

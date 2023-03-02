import { useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import geo from "../store/slices/geo";
import Script from "next/script";

export default function MapLoader({ dispatch }) {
  const { locale } = useRouter();

  const mapLocale = useMemo(
    () => (locale === "ru" ? "ru_RU" : "ru_RU"), // FIXME incorrect geocoding info
    [locale]
  );

  const onApiLoaded = useCallback(() => {
    ymaps.ready(function () {
      dispatch(geo.actions.setAPILoaded());
    });
  }, [dispatch]);

  return (
    <Script
      src={`https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_MAP_API_KEY}&lang=${mapLocale}`}
      strategy="afterInteractive"
      onLoad={onApiLoaded}
    />
  );
}

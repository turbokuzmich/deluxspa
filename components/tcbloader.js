import Script from "next/script";

export default function TCBLoader() {
  return (
    <Script
      src="https://forma.tinkoff.ru/static/onlineScript.js"
      strategy="afterInteractive"
    />
  );
}

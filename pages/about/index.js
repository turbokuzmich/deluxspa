import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import A from "@mui/material/Link";
import Link from "next/link";

export default function About() {
  return (
    <Layout>
      <>
        <Container>
          <Box
            sx={{
              pt: 8,
              width: {
                md: 800,
              },
            }}
          >
            <Typography
              variant="h3"
              sx={{ textTransform: "uppercase" }}
              paragraph
            >
              DeluxSPA
            </Typography>
            <Typography variant="h5" paragraph>
              Профессиональный путь к красоте
            </Typography>
            <Typography>
              ООО «Демидов Люкс СПА» является участником внешнеэкономической
              деятельности с 2020 года, представляя на зарубежных рынках
              продукцию высокого качества. Торговые марки Delux SPA,{" "}
              <Link href="https://yoko.ru" passHref>
                <A target="_blank">Yoko</A>
              </Link>
              ,{" "}
              <Link href="https://neon-beard.ru" passHref>
                <A target="_blank">Neon Beard</A>
              </Link>
              ,{" "}
              <Link href="https://sporthit.online" passHref>
                <A target="_blank">Sport Hit</A>
              </Link>
              ,{" "}
              <Link href="https://stopvirus.moscow" passHref>
                <A target="_blank">NEW//BREEZE</A>
              </Link>{" "}
              представлены на рынках стран СНГ, а также азиатских стран. Наши
              международные партнеры – это успешные и быстро развивающиеся
              компании. Всегда рады сотрудничеству.
            </Typography>
          </Box>
        </Container>
      </>
    </Layout>
  );
}

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function Promo() {
  const { t } = useTranslation();

  return (
    <Layout>
      <>
        <Container>
          <Box
            sx={{
              pt: 8,
            }}
          >
            <Typography
              variant="h3"
              sx={{ textTransform: "uppercase" }}
              paragraph
            >
              {t("menu-promo")}
            </Typography>
          </Box>
        </Container>
      </>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

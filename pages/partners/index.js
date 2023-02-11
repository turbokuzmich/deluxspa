import A from "@mui/material/Link";
import Box from "@mui/material/Box";
import Image from "../../components/image";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function Partners() {
  const { t } = useTranslation();

  return (
    <Layout title={t("page-title-partners")}>
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
            {t("menu-partners")}
          </Typography>
          <A
            href="http://cprm.ru"
            target="_blank"
            rel="nofollow"
            sx={{
              gap: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image
              src="/images/partners/cprm.png"
              alt={t("partner-cprm-title")}
            />
            <Typography component="span" variant="h5">
              {t("partner-cprm-title")}
            </Typography>
          </A>
        </Box>
      </Container>
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

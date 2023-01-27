import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Layout from "../../components/layout";
import A from "@mui/material/Link";
import Link from "next/link";
import Image from "../../components/image";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

// <Typography paragraph>
//   ООО «Демидов Люкс СПА» в{" "}
//   <Link href="https://i.moscow/company/1862605" passHref>
//     <A target="_blank">Московском инновационном кластере</A>
//   </Link>{" "}
//   и{" "}
//   <Link href="https://catalog.moscow-export.com/industrie/ooo-demidov-lyuks-spa/" passHref>
//     <A target="_blank">Московском экспортном центре</A>
//   </Link>
//   .
// </Typography>
export default function About() {
  const { locale } = useRouter();
  const { t } = useTranslation();

  return (
    <Layout title={t("page-title-about")}>
      <>
        <Container>
          <Image
            src="/images/about.jpg"
            alt="about"
            sx={{
              maxWidth: "100%",
            }}
          />
        </Container>
        <Container>
          <Box
            sx={{
              gap: {
                md: 8,
              },
              display: {
                md: "flex",
              },
            }}
          >
            <Box
              sx={{
                pt: 4,
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
                DeluxSPA
              </Typography>
              <Typography variant="h5" paragraph>
                {t("about-page-title")}
              </Typography>
              <Typography variant="subtitle1" paragraph>
                {t("about-page-text")}{" "}
                <Link href="mailto:office@deluxspa.ru" passHref>
                  <A>office@deluxspa.ru</A>
                </Link>
                ,{" "}
                <Link href="https://wa.me/79263853751" passHref>
                  <A>WhatsApp</A>
                </Link>{" "}
                {t("about-page-or")}{" "}
                <Link href="https://t.me/neon_beard" passHref>
                  <A>Telegram</A>
                </Link>
                , {t("about-page-call")}{" "}
                <Link href="tel:+74956659015" passHref>
                  <A>{t("about-page-directly")}</A>
                </Link>
                .
              </Typography>
            </Box>
            <Box
              sx={{
                pt: {
                  md: locale === "ru" ? 8 : 4,
                },
                pb: {
                  xs: 4,
                  md: 8,
                },
                width: {
                  md: 400,
                },
                flexShrink: 0,
              }}
            >
              <Typography
                variant="h4"
                sx={{ textTransform: "uppercase" }}
                paragraph
              >
                {t("bank-requisites")}
              </Typography>
              <Typography variant="h6" paragraph>
                {t("company-full-name")}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("payment-account")}
                      </TableCell>
                      <TableCell align="right">40702810200000000401</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("correspondent-account")}
                      </TableCell>
                      <TableCell align="right">30101810200000000700</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("bik")}
                      </TableCell>
                      <TableCell align="right">044525700</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("inn")}
                      </TableCell>
                      <TableCell align="right">7751525117</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("kpp")}
                      </TableCell>
                      <TableCell align="right">775001001</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("okpo")}
                      </TableCell>
                      <TableCell align="right">42943661</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("ogrn")}
                      </TableCell>
                      <TableCell align="right">5147746230297</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
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

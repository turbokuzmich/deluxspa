import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import Link from "next/link";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import Playmarket from "./playmarket";
import { useTranslation } from "next-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        backgroundColor: "background.footer",
        color: "common.white",
        flexShrink: 0,
        flexGrow: 0,
        pt: {
          xs: 3,
          md: 6,
        },
        pb: {
          xs: 3,
          md: 6,
        },
      }}
    >
      <Container
        sx={{
          gap: {
            xs: 2,
            md: 8,
          },
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >
        <Box
          sx={{
            width: {
              xs: "100%",
              md: "33.333%",
            },
            flexShrink: 0,
            flexGrow: 0,
            textAlign: {
              xs: "center",
              md: "initial",
            },
          }}
        >
          <Typography
            sx={{
              mb: {
                md: 2,
              },
            }}
          >
            {t("footer-text-top")}
          </Typography>
          <Typography>{t("footer-text-bottom")}</Typography>
        </Box>
        <Box
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Typography>
            <Link href="/promo" passHref>
              <A data-variant="footer">{t("menu-promo")}</A>
            </Link>
          </Typography>
          <Typography>
            <Link href="/cooperation" passHref>
              <A data-variant="footer">{t("menu-cooperation")}</A>
            </Link>
          </Typography>
          <Typography>
            <PlaymarketLink />
          </Typography>
        </Box>
        <Box
          sx={{
            display: {
              xs: "none",
              md: "initial",
            },
            width: "33.333%",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <Typography paragraph>
            <Link href="/promo" passHref>
              <A data-variant="footer">{t("menu-promo")}</A>
            </Link>
          </Typography>
          <Typography paragraph>
            <Link href="/cooperation" passHref>
              <A data-variant="footer">{t("menu-cooperation")}</A>
            </Link>
          </Typography>
          <Typography paragraph>
            <PlaymarketLink />
          </Typography>
        </Box>
        <Box
          sx={{
            width: {
              xs: "100%",
              md: "33.333%",
            },
            display: {
              xs: "flex",
              md: "initial",
            },
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <Typography
            sx={{
              position: "relative",
              pl: 4,
              width: {
                xs: 180,
                md: "auto",
              },
            }}
            paragraph
          >
            <PhoneIcon
              fontSize="small"
              sx={{
                position: "absolute",
                left: 0,
                top: 5,
              }}
            />
            <A href="tel:+74956659015" data-variant="footer">
              +7 (495) 665 9015
            </A>
            <br />
            <A href="tel:+79263853751" data-variant="footer">
              +7 926 385 3751
            </A>
          </Typography>
          <Typography
            sx={{
              position: "relative",
              pl: 4,
              width: {
                xs: 180,
                md: "auto",
              },
            }}
          >
            <EmailIcon
              fontSize="small"
              sx={{
                position: "absolute",
                left: 0,
                top: 5,
              }}
            />
            <A href="mailto:office@deluxspa.ru" data-variant="footer">
              office@deluxspa.ru
            </A>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

function PlaymarketLink() {
  const { t } = useTranslation();

  return (
    <Link
      passHref
      href="https://play.google.com/store/apps/details?id=com.wAtpmarket_10254794"
    >
      <A
        target="_blank"
        data-variant="footer"
        sx={{
          gap: 1,
          display: "flex",
          whiteSpace: "nowrap",
        }}
      >
        <Playmarket />
        <Typography component="span">{t("download-playmarket")}</Typography>
      </A>
    </Link>
  );
}

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

export default function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: "background.footer",
        color: "common.white",
        flexShrink: 0,
        flexGrow: 0,
        pt: 6,
        pb: 6,
      }}
    >
      <Container
        sx={{
          gap: 8,
          display: "flex",
        }}
      >
        <Box
          sx={{
            width: "33.333%",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <Typography paragraph>
            Продукция из&nbsp;лучших компонентов по&nbsp;привлекательной
            стоимости.
          </Typography>
          <Typography>
            Delux SPA&nbsp;&mdash; лучшее от&nbsp;природы.
          </Typography>
        </Box>
        <Box
          sx={{
            width: "33.333%",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <Typography>
            Россия, г. Москва, г. Московский, ул. Академика Чумакова, д. 6, оф.
            117
          </Typography>
        </Box>
        <Box
          sx={{
            width: "33.333%",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <Typography
            sx={{
              position: "relative",
              pl: 4,
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
            <Link href="tel:+74956659015" data-variant="footer">
              +7 (495) 665 9015
            </Link>
            <br />
            <Link href="tel:+79263853751" data-variant="footer">
              +7 926 385 3751
            </Link>
          </Typography>
          <Typography
            sx={{
              position: "relative",
              pl: 4,
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
            <Link href="mailto:office@deluxspa.ru" data-variant="footer">
              office@deluxspa.ru
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

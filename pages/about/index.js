import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import A from "@mui/material/Link";
import Link from "next/link";

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
  return (
    <Layout>
      <>
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
                pt: {
                  xs: 4,
                  md: 8,
                },
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
                Профессиональный путь к красоте
              </Typography>
              <Typography paragraph>
                ООО «Демидов Люкс СПА» является участником внешнеэкономической
                деятельности с 2020 года, представляя на зарубежных рынках
                продукцию высокого качества.
              </Typography>
            </Box>
            <Box
              sx={{
                pt: {
                  md: 8,
                },
                pb: {
                  xs: 4,
                  md: 8,
                },
                width: {
                  md: 300,
                },
                flexShrink: 0,
              }}
            >
              <Typography
                variant="h4"
                sx={{ textTransform: "uppercase" }}
                paragraph
              >
                Реквизиты
              </Typography>
              <Typography>ООО «Демидов Люкс СПА»</Typography>
              <Typography>р/с 40702810200000000401</Typography>
              <Typography>Кор/с 30101810200000000700</Typography>
              <Typography>БИК 044525700</Typography>
              <Typography>ИНН 7751525117</Typography>
              <Typography>КПП 775001001</Typography>
              <Typography>ОКПО 42943661</Typography>
              <Typography>ОГРН 5147746230297</Typography>
            </Box>
          </Box>
        </Container>
      </>
    </Layout>
  );
}

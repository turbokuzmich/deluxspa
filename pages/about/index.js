import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Layout from "../../components/layout";
import A from "@mui/material/Link";
import Link from "next/link";
import Image from "../../components/image";

export default function About() {
  return (
    <Layout>
      <>
        <Container>
          <Image
            src="/images/about.jpg"
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
                Профессиональный путь к красоте
              </Typography>
              <Typography variant="subtitle1" paragraph>
                Здравствуйте. Спасибо, что посетили наш сайт. Мы&nbsp;заботимся
                о&nbsp;наших клиентах и&nbsp;всегда рады предложить продукцию
                самого высокого качества по&nbsp;приятным, умеренным ценам.
                Компания ООО &laquo;Демидов Люкс СПА&raquo; основана
                в&nbsp;октябре 2014 года и&nbsp;внесена в&nbsp;международный
                каталог Московского Экспортного Центра (МЭЦ). Качество продукции
                и&nbsp;отзывы профессионалов являются приоритетом в&nbsp;нашей
                работе. Производство и&nbsp;офисы расположены в&nbsp;городе
                Москва и&nbsp;ближайшем Подмосковье, а&nbsp;нашу
                продукцию&nbsp;Вы можете приобрести у&nbsp;наших партнёров, или
                обратившись напрямую к&nbsp;нам. Всегда открыты
                к&nbsp;предложениям и&nbsp;сотрудничеству. Пишите нам на&nbsp;
                <Link href="mailto:office@deluxspa.ru" passHref>
                  <A>office@deluxspa.ru</A>
                </Link>
                ,{" "}
                <Link href="https://wa.me/79263853751" passHref>
                  <A>WhatsApp</A>
                </Link>{" "}
                или{" "}
                <Link href="https://t.me/neon_beard" passHref>
                  <A>Telegram</A>
                </Link>
                , а&nbsp;также звоните{" "}
                <Link href="tel:+74956659015">
                  <A>напрямую</A>
                </Link>
                .
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
                Реквизиты
              </Typography>
              <Typography variant="h6" paragraph>
                ООО «Демидов Люкс СПА»
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        р/c
                      </TableCell>
                      <TableCell align="right">40702810200000000401</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Кор/с
                      </TableCell>
                      <TableCell align="right">30101810200000000700</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        БИК
                      </TableCell>
                      <TableCell align="right">044525700</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        ИНН
                      </TableCell>
                      <TableCell align="right">7751525117</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        КПП
                      </TableCell>
                      <TableCell align="right">775001001</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        ОКПО
                      </TableCell>
                      <TableCell align="right">42943661</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        ОГРН
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

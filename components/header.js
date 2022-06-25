import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Logo from "../components/logo";
import A from "@mui/material/Link";
import Link from "next/link";
import { mainMenu } from "../constants";
import { useRouter } from "next/router";

export default function Header(props) {
  const { pathname } = useRouter();

  return (
    <Box sx={{ backgroundColor: "common.white", flexShrink: 0, flexGrow: 0 }}>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          pt: 1,
          pb: 1,
        }}
      >
        <Link href="/" passHref>
          <A>
            <Logo
              sx={{
                width: 80,
                display: "block",
              }}
            />
          </A>
        </Link>
        <Box
          sx={{
            ml: 6,
            display: "flex",
            gap: 2,
          }}
        >
          {mainMenu
            .filter(({ hidden }) => !hidden)
            .map(({ title, link }) => {
              const isSelected = link !== "/" && pathname.startsWith(link);

              const styles = {
                position: "relative",
                "&::before, &::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  height: "2px",
                  backgroundColor: "text.primary",
                  transition: "left .2s ease-out, right .2s ease-out",
                  left: "50%",
                  right: "50%",
                },
                "&:hover": {
                  color: "text.primary",
                },
                "&:hover::before": {
                  left: 0,
                },
                "&:hover::after": {
                  right: 0,
                },
                ...(isSelected
                  ? {
                      color: "text.primary",
                      "&::before": {
                        left: 0,
                      },
                      "&::after": {
                        right: 0,
                      },
                    }
                  : {}),
              };

              return (
                <Link key={link} href={link} passHref>
                  <A variant="h6" underline="none" sx={styles}>
                    {title}
                  </A>
                </Link>
              );
            })}
        </Box>
      </Container>
    </Box>
  );
}

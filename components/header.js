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
    <Box sx={{ backgroundColor: "common.white" }}>
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
          {mainMenu.map(({ title, link }) => {
            const isSelected = pathname !== "/" && pathname === link;

            return (
              <Link key={link} href={link} passHref>
                <A variant="h6" selected={isSelected}>
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

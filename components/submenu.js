import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import Link from "next/link";
import { catalogTree } from "../constants";

export default function Submenu() {
  return (
    <Box>
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {catalogTree.map(({ id, title, categories }) => (
          <Box key={id} sx={{ display: "flex" }}>
            {categories ? (
              <>
                <Typography
                  variant="h6"
                  color="text.disabled"
                  sx={{
                    pt: 2,
                    pb: 2,
                    pr: 1,
                  }}
                >
                  {title}:
                </Typography>
                {categories.map(({ id, title }) => (
                  <Link key={id} href={`/catalog/${id}`} passHref>
                    <A underline="none" variant="h6" submenuItem>
                      {title}
                    </A>
                  </Link>
                ))}
              </>
            ) : (
              <Link href={`/catalog/${id}`} passHref>
                <A underline="none" variant="h6" submenuItem>
                  {title}
                </A>
              </Link>
            )}
          </Box>
        ))}
      </Container>
    </Box>
  );
}

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
          justifyContent: "flex-start",
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
                  <SubmenuLink key={id} id={id} title={title} />
                ))}
              </>
            ) : (
              <SubmenuLink id={id} title={title} />
            )}
          </Box>
        ))}
      </Container>
    </Box>
  );
}

function SubmenuLink({ id, title }) {
  return (
    <Link href={`/catalog/${id}`} passHref>
      <A
        underline="none"
        variant="h6"
        sx={{
          pl: 1,
          pt: 2,
          pr: 1,
          pb: 2,
          "&:hover": {
            color: "text.primary",
            backgroundColor: "background.paper",
          },
        }}
      >
        {title}
      </A>
    </Link>
  );
}

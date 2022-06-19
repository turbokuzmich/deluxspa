import { useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";
import Header from "../../../components/header";
import Image from "../../../components/image";
import Submenu from "../../../components/submenu";
import Typography from "@mui/material/Typography";
import { catalogItems, compositionItems } from "../../../constants";
import get from "lodash/get";

export default function Item() {
  const {
    query: { id },
  } = useRouter();

  const item = useMemo(() => catalogItems.find((item) => item.id === id), [id]);

  return (
    <>
      <Header />
      <Submenu />
      {item ? (
        <Container>
          <Box
            sx={{
              gap: 6,
              display: "flex",
            }}
          >
            <Box
              sx={{
                width: "50%",
                flexShrink: 0,
                flexGrow: 0,
              }}
            >
              <Image src="/images/item.jpg" sx={{ maxWidth: "100%" }} />
            </Box>
            <Box
              sx={{
                width: "50%",
                flexShrink: 0,
                flexGrow: 0,
                pt: 4,
              }}
            >
              <Typography variant="h4">{item.title}</Typography>
              <Typography variant="h6" paragraph>
                {item.brief}
              </Typography>
              <Consumption item={item} />
              <Composition item={item} />
              {get(item, "description", []).map((line) => (
                <Typography
                  dangerouslySetInnerHTML={{ __html: line }}
                  paragraph
                />
              ))}
            </Box>
          </Box>
        </Container>
      ) : null}
    </>
  );
}

function Consumption({ item: { consumption } }) {
  if (!consumption) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">Потребление:</Typography>
      <Typography component="ul" paragraph>
        {["common", "back"].map((id) => (
          <Typography key={id} component="li">
            {consumption[id]}
          </Typography>
        ))}
      </Typography>
    </>
  );
}

function Composition({ item: { composition } }) {
  if (!composition) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">Состав:</Typography>
      <Typography component="ul" paragraph>
        {composition.map((id) => (
          <Typography key={id} component="li">
            {compositionItems[id].title}
          </Typography>
        ))}
      </Typography>
    </>
  );
}

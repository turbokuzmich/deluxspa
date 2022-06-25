import { useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import Image from "../../../components/image";
import Submenu from "../../../components/submenu";
import Typography from "@mui/material/Typography";
import get from "lodash/get";
import {
  catalogItems,
  compositionItems,
  consumptionTitles,
} from "../../../constants";
import Price from "../../../components/price";

export default function Item() {
  const {
    query: { id },
  } = useRouter();

  const item = useMemo(() => catalogItems.find((item) => item.id === id), [id]);

  return (
    <Layout>
      <>
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
                <Image
                  src={item.image ? item.image : "/images/item.jpg"}
                  sx={{ maxWidth: "100%" }}
                />
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
                <Typography variant="h3" paragraph>
                  <Price sum={item.price} />
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
    </Layout>
  );
}

function Consumption({ item: { consumption } }) {
  if (!consumption) {
    return null;
  }

  return (
    <>
      <Typography variant="h6">Расход на процедуру:</Typography>
      <Typography component="ul" paragraph>
        {["common", "back"].map((id) => (
          <Typography key={id} component="li">
            {consumptionTitles[id]}: {consumption[id]}
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

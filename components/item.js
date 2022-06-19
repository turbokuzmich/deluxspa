import { useMemo } from "react";
import Box from "@mui/material/Box";
import A from "@mui/material/Link";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import Image from "./image";
import { catalogItems } from "../constants";

export default function Item({ id }) {
  const item = useMemo(() => catalogItems.find((item) => item.id === id), []);

  return (
    <Link href={`/catalog/item/${item.id}`} passHref>
      <A
        underline="none"
        sx={{
          p: 4,
          color: "custom.link",
          width: 362,
          flexShrink: 0,
          position: "relative",
          backgroundColor: "common.white",
          "& .title::after, & .title::before": {
            bottom: "6px",
            content: '""',
            height: "2px",
            position: "absolute",
            transition: "left .2s ease-out, right .2s ease-out",
            backgroundColor: "background.paper",
          },
          "& .title::before": {
            left: "50%",
            right: "50%",
          },
          "& .title::after": {
            left: "50%",
            right: "50%",
          },
          "&:hover": {
            color: "text.primary",
          },
          "&:hover .title::before": {
            left: 0,
          },
          "&:hover .title::after": {
            right: 0,
          },
        }}
      >
        <Box
          sx={{
            pt: 1,
            pb: 1,
            pl: 2,
            pr: 2,
            position: "absolute",
            backgroundColor: "custom.attention",
          }}
        >
          <Typography
            color="info.contrastText"
            sx={{ textTransform: "uppercase", fontWeight: "bold" }}
          >
            похудение
          </Typography>
        </Box>
        <Box
          sx={{
            mb: 4,
            height: 280,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Image
            className="image"
            src="/images/item.jpg"
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </Box>
        <Typography
          className="title"
          variant="h6"
          sx={{
            pb: 1,
            position: "relative",
          }}
        >
          {item.title}
        </Typography>
        <Typography variant="subtitle2">{item.brief}</Typography>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            color="text.primary"
            sx={{ fontWeight: "bold" }}
          >
            455 ₽
          </Typography>
          <Typography variant="subtitle2">200 мл.</Typography>
        </Box>
      </A>
    </Link>
  );
}

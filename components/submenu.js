import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Container from "@mui/material/Container";
import A from "@mui/material/Link";
import Link from "next/link";
import { catalogTree } from "../constants";
import get from "lodash/get";

export default function Submenu() {
  const router = useRouter();

  const [linkRef, setLinkRef] = useState(null);
  const [category, setCategory] = useState(null);

  const onClick = useCallback(
    (event) => {
      const element = event.target;
      const id = element.dataset.id;

      const category = catalogTree.find((category) => category.id === id);

      if (!category.categories) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setLinkRef(element);
      setCategory(category);
    },
    [setLinkRef, setCategory]
  );

  const onClose = useCallback(() => {
    setLinkRef(null);
  }, [setLinkRef, setCategory]);

  const onCategory = useCallback(
    (event) => {
      onClose();

      router.push(`/catalog/category/${event.target.dataset.id}`);
    },
    [router, onClose]
  );

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
      }}
    >
      <Container
        sx={{
          gap: 8,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {catalogTree.map(({ id, title }) => (
          <Link key={id} href={`/catalog/category/${id}`} passHref>
            <A
              underline="none"
              variant="h6"
              onClick={onClick}
              data-id={id}
              sx={{
                color:
                  linkRef && get(category, "id") === id
                    ? "text.primary"
                    : "custom.link",
                pt: 3,
                pb: 3,
              }}
            >
              {title}
            </A>
          </Link>
        ))}
        <Menu
          open={linkRef !== null}
          anchorEl={linkRef}
          onClose={onClose}
          sx={{
            "& .MuiMenu-list": {
              width: 200,
            },
          }}
        >
          {category
            ? category.categories.map((category) => (
                <MenuItem
                  key={category.id}
                  data-id={category.id}
                  onClick={onCategory}
                >
                  {category.title}
                </MenuItem>
              ))
            : null}
        </Menu>
      </Container>
    </Box>
  );
}

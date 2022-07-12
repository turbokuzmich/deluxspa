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

export default function Submenu({ selected, sx = {} }) {
  const router = useRouter();

  const [selectedCategoryRef, setSelectedCategoryRef] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

      setSelectedCategoryRef(element);
      setSelectedCategory(category);
    },
    [setSelectedCategoryRef, setSelectedCategory]
  );

  const onClose = useCallback(
    () => setSelectedCategoryRef(null),
    [setSelectedCategoryRef, setSelectedCategory]
  );

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
        ...sx,
      }}
    >
      <Container
        sx={{
          gap: 8,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {catalogTree.map(({ id, title }) => {
          const isContextMenuOpen =
            (selectedCategoryRef && get(selectedCategory, "id") === id) ||
            selected === id;

          return (
            <Link key={id} href={`/catalog/category/${id}`} passHref>
              <A
                underline="none"
                variant="h6"
                onClick={onClick}
                data-id={id}
                sx={{
                  position: "relative",
                  textTransform: "uppercase",
                  color: isContextMenuOpen ? "text.primary" : "custom.link",
                  pt: 3,
                  pb: 3,
                  "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    height: "2px",
                    backgroundColor: "text.primary",
                    transition: "left .2s ease-out, right .2s ease-out",
                    bottom: 27,
                    left: "50%",
                    right: "50%",
                  },
                  "&::before": {
                    left: isContextMenuOpen ? 0 : "50%",
                  },
                  "&:hover::before": {
                    left: 0,
                  },
                  "&::after": {
                    right: isContextMenuOpen ? 0 : "50%",
                  },
                  "&:hover::after": {
                    right: 0,
                  },
                }}
              >
                {title}
              </A>
            </Link>
          );
        })}
        <Menu
          open={selectedCategoryRef !== null}
          anchorEl={selectedCategoryRef}
          onClose={onClose}
          sx={{
            "& .MuiMenu-list": {
              minWidth: 300,
            },
          }}
        >
          {selectedCategory
            ? selectedCategory.categories.map((category) => (
                <MenuItem
                  key={category.id}
                  data-id={category.id}
                  onClick={onCategory}
                  sx={{ textTransform: "uppercase" }}
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

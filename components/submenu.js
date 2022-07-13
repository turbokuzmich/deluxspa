import { useRouter } from "next/router";
import { useState, useCallback, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import Container from "@mui/material/Container";
import A from "@mui/material/Link";
import Link from "next/link";
import { catalogTree } from "../constants";
import { getCategoryById } from "../helpers/catalog";
import get from "lodash/get";
import { isTouch as detectTouch } from "../helpers/features";
import {
  usePopupState,
  bindHover,
  bindMenu,
} from "material-ui-popup-state/hooks";

function HoverSubmenu({ selected, sx = {} }) {
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
        {catalogTree.map(({ id, title }) => (
          <HoverSubmenuItem
            key={id}
            id={id}
            title={title}
            selected={selected === id}
          />
        ))}
      </Container>
    </Box>
  );
}

function HoverSubmenuItem({ id, title, selected }) {
  const { push } = useRouter();

  const popupState = usePopupState({
    variant: "popover",
    popupId: "submenu",
  });

  const onCategory = useCallback(
    (event) => push(`/catalog/category/${event.target.dataset.id}`),
    [push]
  );

  const isSelected = selected || popupState.isOpen;

  return (
    <>
      <Link href={`/catalog/category/${id}`} passHref>
        <A
          underline="none"
          variant="h6"
          sx={{
            position: "relative",
            textTransform: "uppercase",
            color: isSelected ? "text.primary" : "custom.link",
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
              left: isSelected ? 0 : "50%",
            },
            "&:hover::before": {
              left: 0,
            },
            "&::after": {
              right: isSelected ? 0 : "50%",
            },
            "&:hover::after": {
              right: 0,
            },
          }}
          {...bindHover(popupState)}
        >
          {title}
        </A>
      </Link>
      <HoverMenu {...bindMenu(popupState)}>
        {getCategoryById(id).categories.map((category) => (
          <MenuItem
            key={category.id}
            data-id={category.id}
            onClick={onCategory}
            sx={{ textTransform: "uppercase", minWidth: 300 }}
          >
            {category.title}
          </MenuItem>
        ))}
      </HoverMenu>
    </>
  );
}

function TouchSubmenu({ selected, sx = {} }) {
  return <div>touch</div>;
}

export default function Submenu(props) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(detectTouch());
  }, [setIsTouch]);

  return isTouch ? <TouchSubmenu {...props} /> : <HoverSubmenu {...props} />;
}

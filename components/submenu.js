import { useRouter } from "next/router";
import { useState, useCallback, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import ListSubheader from "@mui/material/ListSubheader";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { catalogTree } from "../constants";
import { getCategoryById } from "../lib/helpers/catalog";
import { isTouch as detectTouch } from "../lib/helpers/features";
import {
  usePopupState,
  bindHover,
  bindMenu,
} from "material-ui-popup-state/hooks";

function HoverSubmenu({ parentSelected, sx = {} }) {
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
            selected={parentSelected === id}
          />
        ))}
      </Container>
    </Box>
  );
}

function HoverSubmenuItem({ id, title, selected }) {
  const { t } = useTranslation();
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
      <Typography
        underline="none"
        variant="h6"
        sx={{
          cursor: "pointer",
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
            backgroundColor: "custom.eco",
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
        {t(title)}
      </Typography>
      <HoverMenu {...bindMenu(popupState)}>
        {getCategoryById(id).categories.map((category) => (
          <MenuItem
            key={category.id}
            data-id={category.id}
            onClick={onCategory}
            sx={{ textTransform: "uppercase", minWidth: 300 }}
          >
            {t(category.title)}
          </MenuItem>
        ))}
      </HoverMenu>
    </>
  );
}

function TouchSubmenu({ selected = "", sx = {} }) {
  const { push } = useRouter();
  const { t } = useTranslation();

  const onCategory = useCallback(
    (event) => {
      push(`/catalog/category/${event.target.value}`);
      requestAnimationFrame(() => document.activeElement.blur());
    },
    [push]
  );

  const menuItems = useMemo(
    () =>
      catalogTree.reduce(
        (items, category) => [
          ...items,
          <ListSubheader key={category.id}>{category.title}</ListSubheader>,
          ...category.categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {t(category.title)}
            </MenuItem>
          )),
        ],
        []
      ),
    []
  );

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        pt: 2,
        pb: 2,
        ...sx,
      }}
    >
      <Container>
        <FormControl variant="standard" fullWidth>
          <InputLabel id="submenu-label">{t("choose-category")}</InputLabel>
          <Select
            labelId="submenu-label"
            value={selected}
            onChange={onCategory}
            label="Выберите категорию продукции"
          >
            {menuItems}
          </Select>
        </FormControl>
      </Container>
    </Box>
  );
}

export default function Submenu(props) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(detectTouch());
  }, [setIsTouch]);

  return isTouch ? <TouchSubmenu {...props} /> : <HoverSubmenu {...props} />;
}

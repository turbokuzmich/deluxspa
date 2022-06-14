export const mainMenu = [
  {
    title: "Главная",
    link: "/",
  },
  {
    title: "О нас",
    link: "/about",
  },
  {
    title: "Продукция",
    link: "/catalog",
  },
  {
    title: "Акции",
    link: "/promo",
  },
  {
    title: "Где купить",
    link: "/map",
  },
  {
    title: "Ингредиенты",
    link: "/ingredients",
  },
];

export const catalogTree = [
  {
    id: "oil",
    title: "Масла",
    type: "category",
    categories: [
      {
        id: "body",
        title: "для тела",
        type: "category",
      },
      {
        id: "face",
        title: "для лица",
        type: "category",
      },
      {
        id: "hair",
        title: "для волос",
        type: "category",
      },
    ],
  },
  {
    id: "scrub",
    title: "Скрабы",
    type: "category",
  },
  {
    id: "essential_oil",
    title: "Эфирные масла",
    type: "category",
  },
];

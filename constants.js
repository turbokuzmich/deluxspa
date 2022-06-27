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
    hidden: true,
  },
  {
    title: "Где купить",
    link: "/map",
  },
  {
    title: "Ингредиенты",
    link: "/ingredients",
    hidden: true,
  },
];

export const compositionItems = {
  maize_oil: { title: "маисовое масло" },
  wheat_oil: { title: "масло зародышей пшеницы" },
  vitamin_e: { title: "витамин Е" },
  mint_oil: { title: "натуральное эфирное масло мяты" },
  lemongrass_oil: { title: "эфирное масло лемонграсса" },
  almond_oil: { title: "масло сладкого миндаля" },
  essential_oil: { title: "эфирные масла" },
  sicilian_lemon: { title: "сицилийский лимон" },
  black_pepper: { title: "чёрный перец" },
  ginger: { title: "имбирь" },
  jojoba_oil: { title: "масло жожоба" },
  aroma_composition: { title: "аромакомпозиция" },
};

export const consumptionTitles = {
  common: "общий массаж всего тела",
  back: "массаж спины",
};

export const catalogItems = [
  {
    id: "oil_bio",
    title: "Биологическое",
    brief: "Масло для массажа и ухода за телом",
    price: 1090,
    composition: ["maize_oil", "wheat_oil", "vitamin_e"],
    image: "/images/items/bio.jpg",
    consumption: {
      common: "20–30 мл",
      back: "10–15 мл",
    },
    description: [
      "Имеет уровень скольжения выше среднего и&nbsp;хорошую впитываемость, что позволяет проводить процедуру массажа, раcходуя незначительное количество масла в&nbsp;зависимости от&nbsp;роста и&nbsp;веса клиента.",
      "Восстанавливает гидролипидную мантию на&nbsp;поверхности кожи, питает и&nbsp;увлажняет.",
      "Масло без добавления эфирных масел является гипоаллергенным и&nbsp;подходит для приготовления собственных ароматерапевтических коктейлей в&nbsp;качестве базовой основы. Сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
      "Насыщает витамином&nbsp;Е и&nbsp;полиненасыщенными жирными кислотами, стимулирует процессы регенерации.",
    ],
  },
  {
    id: "oil_mint_breeze",
    title: "Мятный бриз",
    brief: "Масло для массажа и ухода за телом",
    price: 1090,
    composition: ["maize_oil", "wheat_oil", "mint_oil"],
    image: "/images/items/mint_breeze.jpg",
    consumption: {
      common: "20–30 мл",
      back: "10–15 мл",
    },
    description: [
      "Имеет уровень скольжения выше среднего и&nbsp;хорошую впитываемость, что позволяет проводить процедуру массажа, раcходуя незначительное количество масла в&nbsp;зависимости от&nbsp;роста и&nbsp;веса клиента.",
      "Оказывает успокаивающее, релаксирующее действие на&nbsp;нервную систему. Освежает, дарит чувство лёгкой прохлады и&nbsp;окутыввет нежным мятным ароматом. Снимает нервное напряжение, освежает, создавая ощущение лёгкого бриза.",
      "Собранный профессиональными аромакологами сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
    ],
  },
  {
    id: "oil_lemongrass",
    title: "Лемонграсс",
    brief: "Масло для массажа и ухода за телом",
    price: 1090,
    composition: ["maize_oil", "wheat_oil", "vitamin_e", "lemongrass_oil"],
    image: "/images/items/lemongrass.jpg",
    consumption: {
      common: "20–30 мл",
      back: "10–15 мл",
    },
    description: [
      "Имеет уровень скольжения выше среднего и&nbsp;хорошую впитываемость, что позволяет проводить процедуру массажа, раcходуя незначительное количество масла в&nbsp;зависимости от&nbsp;роста и&nbsp;веса клиента.",
      "Сочный аромат тайского лемонграсса стимулирует ясность ума, заряжает энергией.",
      "Лемонграсс стимулирует вывод застойной жидкости, стимулирует липолиз, помогает выровнять рельеф кожи и&nbsp;отлично дезодорирует. Подходит для кожи, склонной к&nbsp;угревым высыпаниям, купирует воспалительные процессы.",
      "Собранный профессиональными аромакологами сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
    ],
  },
  {
    id: "oil_extra_slim",
    title: "Экстра слим",
    brief: "Масло для массажа и ухода за телом",
    price: 2290,
    image: "/images/items/extra_slim.jpg",
    composition: [
      "almond_oil",
      "maize_oil",
      "wheat_oil",
      "essential_oil",
      "sicilian_lemon",
      "black_pepper",
      "ginger",
    ],
    consumption: {
      common: "20–25 мл",
      back: "8–12 мл",
    },
    description: [
      "Главный инструмент массажиста-скульптора в&nbsp;борьбе с&nbsp;целлюлитом и&nbsp;лишним весом.",
      "Имеет уровень скольжения выше среднего и&nbsp;хорошую впитываемость, что позволяет проводить процедуру массажа, раcходуя незначительное количество масла в&nbsp;зависимости от&nbsp;роста и&nbsp;веса клиента.",
      "Мощная динамика, внутренний разогрев (нет раздражающего действия капсаицина), выведение застойной жидкости. Масло + массаж = уменьшение объёмов + видимый лифтинг эффект. Мощное лимфотоническое, супер липолитическое, противовоспалительное. Повышает концентрацию внимания, выводит застойную жидкость, стимулирует липолитические процессы в&nbsp;подкожно-жировом слое.",
      "Собранный профессиональными аромакологами сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
    ],
  },
  {
    id: "oil_bubble_gum",
    title: "Баббл гам",
    price: 1890,
    brief: "Масло для массажа и ухода за телом",
    composition: ["almond_oil", "maize_oil", "jojoba_oil", "aroma_composition"],
    image: "/images/items/bubble_gum.jpg",
    consumption: {
      common: "20–25 мл",
      back: "8–12 мл",
    },
    description: [
      "Имеет уровень скольжения выше среднего и&nbsp;хорошую впитываемость, что позволяет проводить процедуру массажа, раcходуя незначительное количество масла в&nbsp;зависимости от&nbsp;роста и&nbsp;веса клиента.",
      "Нежный всеми знакомый аромат жевательной резинки окунёт вас в&nbsp;весёлую атмосферу диско. Креативный подход к&nbsp;уходу за&nbsp;телом.",
      "Насыщает кожу витаминами и&nbsp;полиненасыщенными жирными кислотами, стимулирует процессы регенерации, оказывает омолаживающее действие, успокаивает нервную систему.",
      "Собранный профессиональными аромакологами сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
    ],
  },
  {
    id: "oil_lemon_cake",
    title: "Лимонный кекс",
    brief: "Масло для массажа и ухода за телом",
    price: 1890,
    composition: ["almond_oil", "maize_oil", "jojoba_oil", "aroma_composition"],
    image: "/images/items/lemon_cake.jpg",
    consumption: {
      common: "20–25 мл",
      back: "8–12 мл",
    },
    description: [
      "Имеет уровень скольжения выше среднего и&nbsp;хорошую впитываемость, что позволяет проводить процедуру массажа, раcходуя незначительное количество масла в&nbsp;зависимости от&nbsp;роста и&nbsp;веса клиента.",
      "Насыщает кожу витаминами и&nbsp;полиненасыщенными жирными кислотами, стимулирует процессы регенерации, оказывает омолаживающее действие, успокаивает нервную систему.",
      "Собранный профессиональными аромакологами сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
    ],
  },
  {
    id: "oil_lime_cinnamon",
    title: "Лайм и корица",
    brief: "Масло для массажа и ухода за телом",
    price: 2190,
    image: "/images/items/lime_cinnamon.jpg",
    composition: [],
    description: [
      "Сочный и&nbsp;пряный аромат лайма и&nbsp;пикантной корицы, настоящий коктейль из&nbsp;цитрусов и&nbsp;специй Азии. В&nbsp;меру сладкий, свежий и&nbsp;пикантный аромат, понравится всем без исключения. Цитрусовая свежесть&nbsp;&mdash; свежее удовольствие!",
      "Активный липолиз, лимфодренирующее действие, разогрев, выведение застойной жидкости. Масло + массаж = уменьшение объёмов + видимый лифтинг эффект. Мощное лимфотоническое, липолитическое действие.",
      "Собранный профессиональными аромакологами сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
    ],
  },
  {
    id: "oil_lemon_pepper",
    title: "Лимон и черный перец",
    brief: "Масло для массажа и ухода за телом",
    price: 2290,
    image: "/images/items/lemon_pepper.jpg",
    composition: [
      "almond_oil",
      "maize_oil",
      "wheat_oil",
      "essential_oil",
      "sicilian_lemon",
      "black_pepper",
    ],
    consumption: {
      common: "20–25 мл",
      back: "8–12 мл",
    },
    description: [
      "Превосходный инструмент массажиста в&nbsp;борьбе с&nbsp;лишним весом.",
      "Имеет уровень скольжения выше среднего и&nbsp;хорошую впитываемость, что позволяет проводить процедуру массажа, раcходуя незначительное количество масла в&nbsp;зависимости от&nbsp;роста и&nbsp;веса клиента.",
      "Мощная динамика, внутренний разогрев (нет раздражающего действия капсаицина), выведение застойной жидкости. Масло + массаж = уменьшение объёмов + видимый лифтинг эффект. Мощное лимфотоническое, супер липолитическое, противовоспалительное. Повышает концентрацию внимания, выводит застойную жидкость, стимулирует липолитические процессы в&nbsp;подкожно-жировом слое.",
      "Собранный профессиональными аромакологами сбалансированный состав бережно ухаживает за&nbsp;кожей, питает и&nbsp;насыщает ненасыщенными кислотами, делая её&nbsp;шелковистой и&nbsp;ухоженной. Масло высокого качества, не&nbsp;камедогенно и&nbsp;содержит комплекс антиоксидантов.",
    ],
  },
];

export const catalogTree = [
  {
    id: "massage_oil",
    title: "Массажные масла",
    type: "category",
    categories: [
      {
        id: "body_massage_oil",
        title: "Массажные масла для тела",
        parent: "massage_oil",
        description: [
          "Лучшее, что создано природой, вы&nbsp;сможете найти в&nbsp;потрясающей натуральной линейке массажных уходовых масел для тела от&nbsp;DeluxSPA.",
          "Привезённые с&nbsp;всех уголков Европы, Азии и&nbsp;Полинезии, натуральные косметические и&nbsp;эфирные масла собраны в&nbsp;уникальные питательные ароматерапевтические коктейли для ухода за&nbsp;телом и&nbsp;проведения процедур массажа.",
          "Органолептические свойства и&nbsp;структура наших масел приятно удивят профессионалов и&nbsp;эстетов органических уходов и&nbsp;профессиональных практиков массажа и&nbsp;SPA.",
          "Созданные профессиональными аромакологами, эликсиры без сомнения найдут отклик у&nbsp;профессилналов и&nbsp;сделают вашу работу полезнее и&nbsp;ароматнее.",
        ],
        type: "category",
        items: [
          "oil_bio",
          "oil_mint_breeze",
          "oil_lemongrass",
          "oil_extra_slim",
          "oil_bubble_gum",
          "oil_lemon_cake",
          "oil_lime_cinnamon",
          "oil_lemon_pepper",
        ],
      },
      {
        id: "face_massage_oil",
        title: "Массажные масла для лица",
        parent: "massage_oil",
        description: [
          "Превосходное скольжение, отличная впитываемость и&nbsp;отсутствие плёнки на&nbsp;поверхности кожи при использовании ультра-лёгких питательных масел для лица. Профессиональные продукты Delux SPA подойдут, как для проведения процедур массажа, так и&nbsp;ухода за&nbsp;кожей лица. Уникальные рецептуры для красоты и&nbsp;молодости.",
        ],
        type: "category",
        items: [
          "oil_bio",
          "oil_mint_breeze",
          "oil_lemongrass",
          "oil_extra_slim",
          "oil_bubble_gum",
          "oil_lemon_cake",
          "oil_lime_cinnamon",
          "oil_lemon_pepper",
        ],
      },
      {
        id: "hair_massage_oil",
        title: "Массажные масла для волос",
        parent: "massage_oil",
        description: [
          "Для здорового внешнего вида волосы нуждаются в&nbsp;постоянном питании и&nbsp;уходе. Для решения данных задач появилась серия средств на&nbsp;основе масел жожоба и&nbsp;ультралёгких растительных и&nbsp;эфирных масел для курсового, переодического и&nbsp;ежедневного применения. Потрясающий вид и&nbsp;отличное состояние ваших волос уже после первых применений масел для волос от&nbsp;Delux SPA.",
        ],
        type: "category",
        items: [
          "oil_bio",
          "oil_mint_breeze",
          "oil_lemongrass",
          "oil_extra_slim",
          "oil_bubble_gum",
          "oil_lemon_cake",
          "oil_lime_cinnamon",
          "oil_lemon_pepper",
        ],
      },
    ],
  },
  {
    id: "scrub",
    title: "Скрабы",
    description: [
      "Линейка натуральных солевых и&nbsp;кофейных органических скрабов с&nbsp;жожоба и&nbsp;эфирными маслами для превосходного ухода за&nbsp;телом и&nbsp;подготовки проведения уходовых SPA-процедур превосходного результата&nbsp;&mdash; показатель высокого уровня заботы о&nbsp;ваших коиентах.",
      "Правильно подобранная дисперсия частиц, питательные масла и&nbsp;натуральные растительные экстракты&nbsp;&mdash; всё&nbsp;то, что вы&nbsp;искали для лучших результатов.",
    ],
    type: "category",
    categories: [
      {
        id: "scrub_for_face",
        title: "Скрабы для лица",
        parent: "scrub",
        description: [
          "Наше лицо, как и&nbsp;наше тело, для того, чтобы выглядеть молодо и&nbsp;ухожено, требует регулярного очищения от&nbsp;ороговевших частиц кожи и&nbsp;загрязнений.",
          "Органический скраб для лица обладает мелкодисперсной структурой и&nbsp;пластичностью, что делает процедуру эксфолиации удобной и&nbsp;экономичной: достаточно лишь щепотки пасты и&nbsp;40&nbsp;секунд для тщательнлй и&nbsp;аккуратной профедуры скрабирования для сияния и&nbsp;здоровья кожи.",
        ],
        type: "category",
        items: [
          "oil_bio",
          "oil_mint_breeze",
          "oil_lemongrass",
          "oil_extra_slim",
          "oil_bubble_gum",
          "oil_lemon_cake",
          "oil_lime_cinnamon",
          "oil_lemon_pepper",
        ],
      },
      {
        id: "scrub_for_body",
        title: "Скрабы для тела",
        parent: "scrub",
        description: [
          "Потрясающая серия солевых и&nbsp;кофейных скрабов различной дисперсности для ухода за&nbsp;телом и&nbsp;подготовки к&nbsp;SPA-процедурам. Широкий спектр действия: от&nbsp;питания до&nbsp;детоксикации, борьбы с&nbsp;лишним весом и&nbsp;восстановления после стрессов и&nbsp;тяжёлых нагрузок.",
        ],
        type: "category",
        items: [
          "oil_bio",
          "oil_mint_breeze",
          "oil_lemongrass",
          "oil_extra_slim",
          "oil_bubble_gum",
          "oil_lemon_cake",
          "oil_lime_cinnamon",
          "oil_lemon_pepper",
        ],
      },
    ],
  },
  {
    id: "aromatherapy",
    title: "Ароматерапия",
    type: "category",
    categories: [
      {
        id: "essential_oil",
        title: "Эфирные масла",
        parent: "aromatherapy",
        description: [
          "Органические эфирные масла для аромакологии и&nbsp;приготовления собственных эфиромасличных коктейлей, а&nbsp;также для создания крафтовой и&nbsp;селективной парфюмерии. Отобранные сортовые масла от&nbsp;известных производителей качественных и&nbsp;натуральных эфиров.",
        ],
        type: "category",
        items: [
          "oil_bio",
          "oil_mint_breeze",
          "oil_lemongrass",
          "oil_extra_slim",
          "oil_bubble_gum",
          "oil_lemon_cake",
          "oil_lime_cinnamon",
          "oil_lemon_pepper",
        ],
      },
      {
        id: "aromatherapy_for_home",
        title: "Ароматерапия для дома",
        parent: "aromatherapy",
        description: [
          "Аура и&nbsp;сенсорика в&nbsp;сбалансированных эфиромасличных арома-коктейлях, диффузорах, спреях для помещений и&nbsp;белья создаст неповторимый почерк и&nbsp;станет отличительной особенностью вашего салона, а&nbsp;также наполнит гармонией ваш дом.",
        ],
        type: "category",
        items: [
          "oil_bio",
          "oil_mint_breeze",
          "oil_lemongrass",
          "oil_extra_slim",
          "oil_bubble_gum",
          "oil_lemon_cake",
          "oil_lime_cinnamon",
          "oil_lemon_pepper",
        ],
      },
    ],
  },
];

export const categoriesDispayedOnPane = [
  ["massage_oil", "body_massage_oil"],
  ["massage_oil", "face_massage_oil"],
  ["massage_oil", "hair_massage_oil"],
  ["scrub", "scrub_for_face"],
  ["scrub", "scrub_for_body"],
  ["aromatherapy", "aromatherapy_for_home"],
  ["aromatherapy", "essential_oil"],
];

export const map = [
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Большая Садовая улица, 3, стр. 1",
    coordinates: [37.591651, 55.766982],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30216" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30217" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30218" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Новокузнецкая улица, 6",
    coordinates: [37.630042, 55.738597],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31711" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31712" },
      {
        number: "8 (800) 200-23-45",
        type: "phone",
        info: "горячая линия сети магазинов Л'ЭТУАЛЬ",
      },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "31711" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "31712" },
    ],
    workingTimeText: "ежедневно, 10:00–21:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, улица Новый Арбат, 11, стр. 1",
    coordinates: [37.594948, 55.752233],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "32254" },
      { number: "8 (800) 550-60-09", type: "phone" },
    ],
    workingTimeText: "ежедневно, круглосуточно",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, улица Земляной Вал, 33",
    coordinates: [37.658522, 55.756775],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30082" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30083" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30084" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30085" },
      {
        number: "8 (800) 200-23-45",
        type: "phone",
        info: "горячая линия сети магазинов Л'ЭТУАЛЬ",
      },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30082" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30083" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30084" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30088" },
    ],
    workingTimeText: "ежедневно, 10:00–23:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Малая Сухаревская площадь, 12",
    coordinates: [37.631732, 55.772336],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33041" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33042" },
      { number: "8 (800) 550-60-09", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33041" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33042" },
    ],
    workingTimeText: "пн-сб 10:00–21:00; вс 11:00–20:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, площадь Киевского Вокзала, 2",
    coordinates: [37.564757, 55.743866],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35017" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35024" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35025" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35026" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35031" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35033" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35034" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35023" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35026" },
    ],
    workingTimeText: "пн-чт 10:00–22:00; пт,сб 10:00–23:00; вс 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Щербаковская улица, 3",
    coordinates: [37.723095, 55.782556],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33626" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33627" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33628" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33626" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33627" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33628" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Новослободская улица, 16",
    coordinates: [37.599067, 55.7818],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30019" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30020" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30021" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30019" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30020" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30021" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Манежная площадь",
    coordinates: [37.615281, 55.755853],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "32175" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "32174" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "32175" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Краснопрудная улица, 15",
    coordinates: [37.66809, 55.780864],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35597" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35598" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Новослободская улица, 4",
    coordinates: [37.601, 55.78],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30836" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30837" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30836" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30837" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Автозаводская улица, 11",
    coordinates: [37.657525, 55.706548],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30266" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30267" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30268" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30266" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30267" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30268" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Таганская улица, 2",
    coordinates: [37.657502, 55.740833],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33266" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33267" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33266" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33267" },
    ],
    workingTimeText: "ежедневно, 09:00–21:00",
    urls: [
      "http://www.letoile.ru/",
      "http://tc-taganka.ru/%D0%BC%D0%B0%D0%B3%D0%B0%D0%B7%D0%B8%D0%BD%D1%8B/",
      "https://www.letu.ru/",
    ],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Воронцовская улица, 49/28с1",
    coordinates: [37.666527, 55.732792],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "32956" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "32957" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "32958" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "32956" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Зеленодольская улица, 40",
    coordinates: [37.76589, 55.704223],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30131" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30131" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30132" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Нахимовский проспект, 57",
    coordinates: [37.561, 55.678],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31721" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31722" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31723" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31724" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "31721" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, проспект Мира, 33к1",
    coordinates: [37.632112, 55.780331],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35196" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35197" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35196" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35197" },
    ],
    workingTimeText: "пн-сб 10:00–21:00; вс 10:00–20:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Ленинский проспект, 72/2",
    coordinates: [37.541459, 55.686106],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31506" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31507" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31508" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31509" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "31506" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "31507" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "31508" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "31509" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Хорошёвское шоссе, 27",
    coordinates: [37.523586, 55.777204],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35206" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35207" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35208" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35209" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35210" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35211" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35206" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35207" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35208" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35209" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35210" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35211" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Верхняя Красносельская улица, 3А",
    coordinates: [37.665727, 55.784929],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "32166" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "32167" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35212" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35213" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "32166" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35212" },
    ],
    workingTimeText: "ежедневно, 09:00–22:00",
    urls: [
      "http://www.letoile.ru/",
      "http://tdktroyka.ru/tdk_shops/health-beauty/l_etual/",
      "https://www.letu.ru/",
    ],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Пресненская набережная, 2",
    coordinates: [37.540648, 55.749419],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31646" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31647" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31656" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "31657" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35530" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35531" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35530" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35531" },
    ],
    workingTimeText: "пн-пт 10:00–22:00; сб 10:00–23:00; вс 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Багратионовский проезд, 5",
    coordinates: [37.507468, 55.744063],
    phones: [
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30236" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30237" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30238" },
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30236" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30237" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30238" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, Измайловское шоссе, 71, корп. А",
    coordinates: [37.752077, 55.789679],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33991" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33992" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "33993" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33991" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33992" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "33993" },
      { number: "+7 (495) 937-12-31", type: "phone" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, проспект Мира, 92, стр. 1",
    coordinates: [37.635398, 55.793533],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "35585" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "35585" },
    ],
    workingTimeText: "пн-сб 09:30–22:00; вс 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
  {
    title: "Л'Этуаль",
    fullAddress: "Россия, Москва, шоссе Энтузиастов, 12, корп. 2",
    coordinates: [37.705956, 55.746791],
    phones: [
      { number: "8 (800) 200-23-45", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30201" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30202" },
      { number: "8 (800) 333-77-11", type: "phone", extraNumber: "30203" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30201" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30202" },
      { number: "8 (800) 550-60-09", type: "phone", extraNumber: "30203" },
    ],
    workingTimeText: "ежедневно, 10:00–22:00",
    urls: ["http://www.letoile.ru/", "https://www.letu.ru/"],
  },
];

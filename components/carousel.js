import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBackIos";
import ArrowForward from "@mui/icons-material/ArrowForwardIos";
import CircularProgress from "@mui/material/CircularProgress";
import A from "@mui/material/Link";
import Link from "next/link";
import Player from "react-player/file";
import * as Color from "color";
import { Carousel } from "react-responsive-carousel";
import { getItemById } from "../helpers/catalog";
import memoize from "lodash/memoize";
import {
  useEffect,
  useState,
  useMemo,
  createContext,
  useContext,
  useCallback,
} from "react";

const PlayerContext = createContext(false);

const originalVideoProportion = 770 / 2600;

const playerSize = {
  width: "100vmax",
  height: `${originalVideoProportion * 100}vmax`,
};

const videoData = [
  {
    itemId: "oil_lemon_pepper",
    link: "/catalog/item/oil_lemon_pepper",
  },
  {
    itemId: "oil_lemongrass",
    link: "/catalog/item/oil_lemongrass",
  },
  {
    itemId: "oil_extra_slim",
    link: "/catalog/item/oil_extra_slim",
  },
  {
    itemId: "oil_bio",
    link: "/catalog/item/oil_bio",
  },
  {
    itemId: "oil_lime_cinnamon",
    link: "/catalog/item/oil_lime_cinnamon",
  },
  {
    itemId: "oil_mint_breeze",
    link: "/catalog/item/oil_mint_breeze",
  },
];

const getNeighborCatalogItems = memoize((index) => {
  const prevIndex = (index + videoData.length - 1) % videoData.length;
  const nextIndex = (index + 1) % videoData.length;

  return [
    getItemById(videoData[prevIndex].itemId),
    getItemById(videoData[nextIndex].itemId),
  ];
});

export default function MainCarousel() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [canShowCarousel, setCanShowCarousel] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const [prevItem, nextItem] = useMemo(
    () => getNeighborCatalogItems(slideIndex),
    [slideIndex]
  );

  const onPlayerReady = useCallback(
    () => setIsPlayerReady(true),
    [setIsPlayerReady]
  );

  const onSlideChanged = useCallback(
    (index) => setSlideIndex(index),
    [setSlideIndex]
  );

  const renderPrev = useCallback(
    (onClick) => (
      <CarouselArrow
        item={prevItem}
        onClick={onClick}
        currentIndex={slideIndex}
      />
    ),
    [slideIndex, prevItem]
  );

  const renderNext = useCallback(
    (onClick) => (
      <CarouselArrow
        item={nextItem}
        onClick={onClick}
        currentIndex={slideIndex}
        forward
      />
    ),
    [slideIndex, nextItem]
  );

  useEffect(() => setCanShowCarousel(true), [setCanShowCarousel]);

  return canShowCarousel ? (
    <PlayerContext.Provider value={isPlayerReady}>
      <Box
        sx={(theme) => ({
          mb: 4,
          "& .carousel-arrow .carousel-arrow-control": {
            backgroundColor: Color(theme.palette.grey["900"])
              .alpha(0.5)
              .rgb()
              .string(),
          },
          "& .carousel-arrow:hover .carousel-arrow-control, &:hover .carousel-arrow:hover .carousel-arrow-control":
            {
              backgroundColor: Color(theme.palette.grey["900"])
                .alpha(0.3)
                .rgb()
                .string(),
            },
          "&:hover .carousel-arrow .carousel-arrow-control": {
            opacity: 1,
            transform: "translate(0, 0)",
          },
        })}
      >
        <Carousel
          className="video-carousel"
          onChange={onSlideChanged}
          showArrows={false}
          showStatus={false}
          showThumbs={false}
          showIndicators={false}
          selectedItem={slideIndex}
          renderArrowPrev={renderPrev}
          renderArrowNext={renderNext}
          infiniteLoop
          emulateTouch
        >
          {videoData.map(({ link }, index) => (
            <Link key={index} href={link} passHref>
              <A>
                <Player
                  onReady={index === 0 ? onPlayerReady : undefined}
                  playing={index === slideIndex}
                  url={`/video/${index + 1}.mp4`}
                  width={playerSize.width}
                  height={playerSize.height}
                  wrapper={PlayerWrapper}
                  muted
                  loop
                />
              </A>
            </Link>
          ))}
        </Carousel>
      </Box>
    </PlayerContext.Provider>
  ) : (
    <Box
      sx={{
        width: playerSize.width,
        height: playerSize.height,
      }}
    />
  );
}

function PlayerWrapper({ children }) {
  const isPlayerReady = useContext(PlayerContext);

  return (
    <Box
      sx={{
        position: "relative",
        width: playerSize.width,
        height: playerSize.height,
        pointerEvents: "none",
      }}
    >
      <>
        {children}
        {isPlayerReady ? null : (
          <Box
            sx={{
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={100} />
          </Box>
        )}
      </>
    </Box>
  );
}

function CarouselArrow({ onClick, item, forward = false }) {
  const isPlayerReady = useContext(PlayerContext);

  const containerStyles = useCallback((theme) => ({
    position: "absolute",
    zIndex: 100,
    top: "50%",
    transform: "translateY(-50%)",
    left: forward ? "initial" : theme.spacing(4),
    right: forward ? theme.spacing(4) : "initial",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: forward ? "flex-end" : "flex-start",
  }));

  const buttonStyles = useMemo(
    () => ({
      color: "common.white",
      width: 100,
      height: 100,
      mb: 4,
      opacity: 0,
      transform: `translate(${forward ? "10px" : "-10px"}, 0)`,
      transition: [
        "background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        "opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
      ].join(","),
    }),
    [forward]
  );

  return isPlayerReady ? (
    <Box className="carousel-arrow" onClick={onClick} sx={containerStyles}>
      <IconButton
        className="carousel-arrow-control carousel-arrow-button"
        sx={buttonStyles}
        disableRipple
      >
        {forward ? <ArrowForward /> : <ArrowBack />}
      </IconButton>
      <ArrowText forward={forward} header>
        {item.title}
      </ArrowText>
      <ArrowText forward={forward}>{item.brief}</ArrowText>
    </Box>
  ) : null;
}

function ArrowText({ children, forward = false, header = false }) {
  const transitionDelay = header ? ".02s" : ".04s";
  const transitionDuration = header ? ".3s" : ".8s";

  return (
    <Typography
      variant={header ? "h5" : "body1"}
      className="carousel-arrow-control"
      sx={{
        pl: 2,
        pr: 2,
        pt: header ? 1 : "5px",
        pb: header ? 0 : 1,
        opacity: 0,
        color: "common.white",
        transform: `translate(${forward ? "10px" : "-10px"}, 0)`,
        transition: [
          "background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          `transform ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1) ${transitionDelay}`,
          `opacity ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1) ${transitionDelay}`,
        ].join(","),
      }}
    >
      {children}
    </Typography>
  );
}

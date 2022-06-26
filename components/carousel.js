import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBackIos";
import ArrowForward from "@mui/icons-material/ArrowForwardIos";
import A from "@mui/material/Link";
import Link from "next/link";
import Player from "react-player/file";
import * as Color from "color";
import { Carousel } from "react-responsive-carousel";

const originalVideoSize = {
  width: 2600,
  height: 770,
};

const originalVideoProportion =
  originalVideoSize.height / originalVideoSize.width;

const videoData = [
  {
    link: "/catalog/item/oil_lemon_pepper",
  },
  {
    link: "/catalog/item/oil_lemongrass",
  },
  {
    link: "/catalog/item/oil_extra_slim",
  },
  {
    link: "/catalog/item/oil_bio",
  },
  {
    link: "/catalog/item/oil_lime_cinnamon",
  },
  {
    link: "/catalog/item/oil_mint_breeze",
  },
];

export default function MainCarousel() {
  const [canShowCarousel, setCanShowCarousel] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const onSlideChanged = useCallback(
    (index) => setSlideIndex(index),
    [setSlideIndex]
  );

  const renderPrev = useCallback(
    (onClick) => <CarouselArrow onClick={onClick} />,
    []
  );

  const renderNext = useCallback(
    (onClick) => <CarouselArrow onClick={onClick} forward />,
    []
  );

  useEffect(() => setCanShowCarousel(true), [setCanShowCarousel]);

  return canShowCarousel ? (
    <Box
      sx={(theme) => ({
        mb: 4,
        "& .carousel-arrow": {
          backgroundColor: Color(theme.palette.grey["900"])
            .alpha(0.5)
            .rgb()
            .string(),
        },
        "& .carousel-arrow:hover, &:hover .carousel-arrow:hover": {
          backgroundColor: Color(theme.palette.grey["900"])
            .alpha(0.3)
            .rgb()
            .string(),
        },
        "& .carousel-arrow:active, &:hover .carousel-arrow:active": {
          backgroundColor: Color(theme.palette.grey["900"])
            .alpha(0.2)
            .rgb()
            .string(),
        },
        "&:hover .carousel-arrow": {
          opacity: 1,
          transform: "translate(0, -50%)",
        },
      })}
    >
      <Carousel
        className="video-carousel"
        onChange={onSlideChanged}
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
                playing={index === slideIndex}
                url={`/video/${index + 1}.mp4`}
                width="100vmax"
                height={`${originalVideoProportion * 100}vmax`}
                muted
                loop
              />
            </A>
          </Link>
        ))}
      </Carousel>
    </Box>
  ) : null;
}

function CarouselArrow({ onClick, forward = false }) {
  const buildStyles = useCallback(
    (theme) => ({
      color: "common.white",
      width: 100,
      height: 100,
      position: "absolute",
      zIndex: 100,
      top: "50%",
      opacity: 0,
      left: forward ? "initial" : theme.spacing(4),
      right: forward ? theme.spacing(4) : "initial",
      transform: `translate(${forward ? "10px" : "-10px"}, -50%)`,
      transition: [
        "background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        "opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
      ].join(","),
    }),
    [forward]
  );

  return (
    <IconButton
      className="carousel-arrow"
      onClick={onClick}
      sx={buildStyles}
      disableRipple
    >
      {forward ? <ArrowForward /> : <ArrowBack />}
    </IconButton>
  );
}

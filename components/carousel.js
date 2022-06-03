import { Carousel } from "react-responsive-carousel";

export default function MainCarousel() {
  return (
    <Carousel
      showStatus={false}
      showThumbs={false}
      showArrows
      autoPlay
      emulateTouch
    >
      <div>
        <img src="https://react-responsive-carousel.js.org/assets/1.jpeg" />
      </div>
      <div>
        <img src="https://react-responsive-carousel.js.org/assets/2.jpeg" />
      </div>
      <div>
        <img src="https://react-responsive-carousel.js.org/assets/3.jpeg" />
      </div>
      <div>
        <img src="https://react-responsive-carousel.js.org/assets/4.jpeg" />
      </div>
      <div>
        <img src="https://react-responsive-carousel.js.org/assets/5.jpeg" />
      </div>
      <div>
        <img src="https://react-responsive-carousel.js.org/assets/5.jpeg" />
      </div>
    </Carousel>
  );
}

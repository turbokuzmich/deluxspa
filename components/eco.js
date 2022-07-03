import * as React from "react";
import Svg from "./svg";
import Path from "./path";

const defaultSx = {
  path: {},
};

export default function SvgComponent({ sx = defaultSx }) {
  const { path: pathSx, ...containerSx } = sx;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      xmlSpace="preserve"
      sx={containerSx}
    >
      <Path
        sx={pathSx}
        d="M486.1 539.8c-27.5 103.6-20.3 211.7-15.8 254 46.4-93.5 154.3-300.6 226.8-354.6-67.4 109-169 252.2-200.2 373.6 202.4.4 364.8-154.4 400.9-318.2C944.7 282.2 990 224.9 990 224.9c-304.1-45-452.2 120-503.9 314.9zm-56.6 167.5c-37-31.3-161.6-140.2-195.7-212.2 37.6 45.2 167.9 149.8 199.5 175 11.9-99.5 39.3-195.6 39.3-195.6S436.4 393.8 304.2 307C220.6 252.1 24.6 187.1 24.6 187.1S-35.8 418.6 88.8 606c150.1 225.7 343.8 206 343.8 206-5.7-30.2-6-66.8-3.1-104.7z"
      />
    </Svg>
  );
}

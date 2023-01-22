import * as Color from "color";
import range from "lodash/range";

const modes = ["lighten", "darken"];

export default function generativeBackground(baseColor) {
  return [
    `radial-gradient(ellipse 100% 100% at 100% 100%, ${Color(baseColor).darken(
      0.2
    )}, ${Color(baseColor).alpha(0)})`,
    `radial-gradient(circle closest-corner at 25% 0%, ${Color(
      baseColor
    ).lighten(0.1)}, ${baseColor})`,
  ].join(",");
}

function genrateRandomGradient(baseColor) {
  // const mode = modes[Math.round(Math.random())];
  const level = Math.round(Math.random() * 20) / 1000 + 0.01;
  const centerColor = Color(baseColor).lighten(level);
  const endColor = centerColor.alpha(0);
  const size = Math.round(Math.random() * 100) + 200;
  const x = Math.round(Math.random() * 50);
  const y = Math.round(Math.random() * 50);
  const stop = Math.round(Math.random() * 40) + 45;

  return `radial-gradient(circle ${size}px at ${x}% ${y}%, ${centerColor.toString()} ${stop}%, ${endColor
    .rgb()
    .toString()})`;
}

import Color from "color";
import { Application, Graphics, Filter } from "pixi.js";
import { useEffect, useRef } from "react";

const fadingTime = 5;

export default function Background({ color, parentRef }) {
  const colorRef = useRef(Color(color));
  const applicationRef = useRef();

  useEffect(() => {
    if (applicationRef.current) {
      return;
    }

    let totalTime = 0;

    applicationRef.current = new Application({
      width: 100,
      height: 100,
      backgroundAlpha: 0,
    });

    const rect = new Graphics();

    const filter = new Filter(
      null,
      `
const vec3 whiteColor = vec3(1.0, 1.0, 1.0);

const float widthFactor = 2.5;
const float mixColor = 0.02;

uniform float time;
uniform float fading;
uniform vec3 color;

varying vec2 vTextureCoord;

vec3 calcSine(vec2 uv, float speed, float frequency, float amplitude, float shift, float offset, vec3 color, float width, float exponent, bool dir) {
  float angle = time * speed * frequency * -1.0 + (shift + uv.x) * 2.0;
  float y = sin(angle) * amplitude + offset;
  float clampY = clamp(0.0, y, y);
  float diffY = y - uv.y;

  float dsqr = distance(y, uv.y);
  float scale = 1.0;

  if (dir && diffY > 0.0) {
    dsqr = dsqr * 4.0;
  } else if (!dir && diffY < 0.0) {
    dsqr = dsqr * 4.0;
  }

  scale = pow(smoothstep(width * widthFactor, 0.0, dsqr), exponent);

  return min(color * scale, color);
}

void main(void)
{
  vec2 uv = vTextureCoord;
  vec3 currentColor = mix(color, whiteColor, (0.5 - uv.y) * fading);
  float currentMixColor = mixColor * fading;

  currentColor += calcSine(uv, 0.2, 0.20, 0.20, 0.0, 0.5, vec3(currentMixColor, currentMixColor, currentMixColor), 0.1, 15.0, false);
  currentColor += calcSine(uv, 0.4, 0.40, 0.15, 0.0, 0.5, vec3(currentMixColor, currentMixColor, currentMixColor), 0.1, 17.0, false);
  currentColor += calcSine(uv, 0.3, 0.60, 0.15, 0.0, 0.5, vec3(currentMixColor, currentMixColor, currentMixColor), 0.05, 23.0, false);

  currentColor += calcSine(uv, 0.1, 0.26, 0.07, 0.0, 0.3, vec3(currentMixColor, currentMixColor, currentMixColor), 0.1, 17.0, true);
  currentColor += calcSine(uv, 0.3, 0.36, 0.07, 0.0, 0.3, vec3(currentMixColor, currentMixColor, currentMixColor), 0.1, 17.0, true);
  currentColor += calcSine(uv, 0.5, 0.46, 0.07, 0.0, 0.3, vec3(currentMixColor, currentMixColor, currentMixColor), 0.05, 23.0, true);
  currentColor += calcSine(uv, 0.2, 0.58, 0.05, 0.0, 0.3, vec3(currentMixColor, currentMixColor, currentMixColor), 0.2, 15.0, true);

  gl_FragColor = vec4(currentColor, 1.0);
}
`,
      {
        time: 0,
        fading: 0,
        color: colorRef.current.unitArray(),
      }
    );

    applicationRef.current.stage.addChild(rect);
    applicationRef.current.stage.filters = [filter];

    applicationRef.current.ticker.add((delta) => {
      if (parentRef.current) {
        const width = parentRef.current.clientWidth;
        const height = parentRef.current.clientHeight;
        const viewWidth = width * 2;
        const viewHeight = height * 2;

        const {
          current: { view, screen, stage },
        } = applicationRef;

        if (view.width !== viewWidth || view.height !== viewHeight) {
          view.width = viewWidth;
          view.height = viewHeight;
          view.style.width = `${width}px`;
          view.style.height = `${height}px`;

          screen.width = viewWidth;
          screen.height = viewHeight;

          stage.width = viewWidth;
          stage.height = viewHeight;

          rect.beginFill();
          rect.drawRect(0, 0, viewWidth, viewHeight);
          rect.endFill();
        }

        filter.uniforms.time = totalTime;
        filter.uniforms.color = colorRef.current.unitArray();

        if (totalTime < fadingTime) {
          filter.uniforms.fading = totalTime / fadingTime;
        } else {
          filter.uniforms.fading = 1;
        }

        totalTime += delta / 60;
      }
    });

    applicationRef.current.view.style.top = "0px";
    applicationRef.current.view.style.left = "0px";
    applicationRef.current.view.style.zIndex = "0";
    applicationRef.current.view.style.touchAction = "none";
    applicationRef.current.view.style.position = "absolute";
    applicationRef.current.view.style.pointerEvents = "none";

    parentRef.current.insertBefore(
      applicationRef.current.view,
      parentRef.current.firstChild
    );
  }, [applicationRef, colorRef, parentRef]);

  useEffect(() => {
    colorRef.current = Color(color);
  }, [color, colorRef]);

  useEffect(() => {
    const application = applicationRef.current;

    return () => {
      if (application) {
        application.filters = [];
        application.view.remove();
        application.ticker.stop();
        application.destroy();

        applicationRef.current = null;
      }
    };
  }, [applicationRef]);

  return null;
}

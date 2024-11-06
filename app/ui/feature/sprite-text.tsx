import {ReactNode, useMemo} from "react";

interface TextProps {
  children: ReactNode;
  position: [number, number, number];
  scale: [number, number, number];
  color?: string;
  fontSize?: number;
}

export function SpriteText({children, position, scale, color = 'white', fontSize = 45}: TextProps) {
  const canvas = useMemo(() => {
    // const fontface = 'Arial';
    const fontsize = fontSize;
    const borderThickness = 4;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.textBaseline = 'middle';
    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;

    const metrics = context.measureText(children as string);
    console.log(metrics);
    const textWidth = metrics.width;

    context.lineWidth = borderThickness;

    context.fillStyle = color;
    context.fillText(children as string, textWidth - textWidth * 0.8, fontsize);
    return canvas;
  }, [children, color, fontSize]);

  if (!canvas) return null;

  return (
    <sprite scale={scale} position={position}>
      <spriteMaterial sizeAttenuation={false} attach="material" transparent alphaTest={0.5}>
        <canvasTexture attach="map" image={canvas}/>
      </spriteMaterial>
    </sprite>
  );
}

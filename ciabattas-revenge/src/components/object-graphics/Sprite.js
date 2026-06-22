import React, { useEffect, useRef } from "react";
import { CELL_SIZE } from "../../helpers/consts";
import useStore from '../../atoms/spriteSheetImageAtom';

function Sprite({ frameCoord, size = 16 }) {
  const spriteSheetImage = useStore((state) => state.spriteSheetImage);
  const canvasRef = useRef();

  useEffect(() => {
    if (!spriteSheetImage) {
      return (
        <canvas
          width={size}
          height={size}
          ref={(canvas) => {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            ctx.fillRect(0, 0, size, size);
          }}
        />
      );
    }

    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext("2d");
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    const tileSheetX = Number(frameCoord.split("x")[0]);
    const tileSheetY = Number(frameCoord.split("x")[1]);
    ctx.drawImage(
      spriteSheetImage,
      tileSheetX * CELL_SIZE,
      tileSheetY * CELL_SIZE,
      size,
      size,
      0,
      0,
      size,
      size
    );

  }, [frameCoord, size, spriteSheetImage]);

  return (
    <canvas width={size} height={size} ref={canvasRef} />
  );
}

export const MemoizedSprite = React.memo(Sprite);
export default MemoizedSprite;


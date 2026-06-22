import { CELL_SIZE } from "@/helpers/consts";
import MemoizedSprite from "../object-graphics/Sprite";
import useStore from "@/atoms/customLevelsAtom";

export default function MapCell({ selected, setSelected, level, x, y, frameCoord }) {
  const setCustomLevels = useStore((image) => image.setCustomLevels);
  return (
    <div style={{
      position: 'absolute',
      left: x * CELL_SIZE,
      top: y * CELL_SIZE,
      width: 16,
      height: 16,
      backgroundColor: level.enableEditing ? 'white' : '',
      cursor: level.enableEditing ? 'pointer' : 'default'
    }}
      onClick={() => {
        if (level.enableEditing) {

          if (x <= 0 || y <= 0) {
            return;
          }
          level.addPlacement({
            ...level.editModePlacementType,
            x,
            y,
          })
          level.saveLocally();
          setCustomLevels(window.localStorage.getItem('customLevels'))
        }
      }}
      onMouseOver={() => setSelected({ x, y })}
      onMouseLeave={() => setSelected({ x: null, y: null })}
    >
      {!(level.enableEditing && selected.x === x && selected.y === y) ? <MemoizedSprite frameCoord={frameCoord} /> : null}
    </div>
  )
}

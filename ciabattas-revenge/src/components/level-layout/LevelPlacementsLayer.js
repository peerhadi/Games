import useStore from "@/atoms/customLevelsAtom";
import { editTilesMap } from "../hud/TopHud";
import React from "react";

export default function LevelPlacementsLayer({ level }) {
  const setCustomLevels = useStore((image) => image.setCustomLevels);
  const handleClick = (placement) => {
    if (!level.enableEditing || !placement.canBeDeleted()) {
      return
    }
    const pickup = editTilesMap.Pickups.find(p => p.type === level.editModePlacementType.type);
    if (pickup) {
      if (!editTilesMap.Pickups.find(p => p.type === placement.type)) {

        level.addPlacement({
          type: level.editModePlacementType.type,
          x: placement.x,
          y: placement.y
        })
      } else {
        level.deletePlacement(placement)
      }
    } else {
      level.deletePlacement(placement)
    }
    level.saveLocally()
    setCustomLevels(window.localStorage.getItem('customLevels'))
  }
  const visiblePlacements = React.useMemo(() => level.placements.filter(placement => !placement.hasBeenCollected && !placement.dontShow).map(placement => ({
    placement,
    style: makeStyle(placement, level.enableEditing)
  })), [level.placements, level.enableEditing])
  return (
    <>
      {visiblePlacements.map(({ placement, style }) => (
        <div key={placement.id} style={style} onClick={() => handleClick(placement)}>
          {placement.renderComponent()}
        </div>
      ))}
    </>
  )
}

function makeStyle(placement, enableEditing) {
  const [x, y] = placement.displayXY();
  const style = {
    position: 'absolute',
    transform: `translate3d(${x}px, ${y}px, 0)`,
    zIndex: placement.zIndex(),
    cursor: enableEditing ? 'pointer' : "",
    height: '16px',
  }
  return style;
}

import MemoizedSprite from "@/components/object-graphics/Sprite";
import { Placement } from "./Placement";
import { TILES } from "@/helpers/tiles";
import { PLACEMENT_TYPE_FLOUR } from "@/helpers/consts";
import soundsManager, { SFX } from "@/classes/Sounds";

export class GoalPlacement extends Placement {
  constructor(properties, level){
    super(properties, level);
  }
  get isDisabled() {
    const nonCollectedFlour = this.level.placements.find(p => {
      return p.type === PLACEMENT_TYPE_FLOUR && !p.hasBeenCollected;
    })
    return Boolean(nonCollectedFlour)
  }
  canBeDeleted() {
    return false
  }
  completesLevelOnCollide() {
    return !this.isDisabled
  }

  renderComponent() {
    return <MemoizedSprite frameCoord={this.isDisabled ? TILES.GOAL_DISABLED : TILES.GOAL_ENABLED} />
  }
}

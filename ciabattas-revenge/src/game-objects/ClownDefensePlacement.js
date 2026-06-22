import { Placement } from "./Placement";
import MemoizedSprite from "@/components/object-graphics/Sprite";
import { TILES } from "@/helpers/tiles";

export class ClownDefensePlacement extends Placement {
  addsItemToInventoryOnCollide() {
    return this.type
  }

  canBeStolen() {
    return false;
  }
  renderComponent() {
    return <MemoizedSprite frameCoord={TILES.CLOWN_DEFENSE_PICKUP} />
  }
}

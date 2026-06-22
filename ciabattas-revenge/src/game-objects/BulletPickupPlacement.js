import { PLACEMENT_TYPE_BULLET_PICKUP, PLACEMENT_TYPE_HERO } from "@/helpers/consts";
import { Placement } from "./Placement";
import MemoizedSprite from "@/components/object-graphics/Sprite";
import { TILES } from "@/helpers/tiles";

export class BulletPickupPlacement extends Placement {
  addsItemToInventoryOnCollide(body) {
    return PLACEMENT_TYPE_BULLET_PICKUP
  }

  renderComponent() {
    return <MemoizedSprite frameCoord={TILES.BULLET_PICKUP} />;
  }
}

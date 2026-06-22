import { PLACEMENT_TYPE_BULLET_PICKUP, PLACEMENT_TYPE_HERO } from "@/helpers/consts";
import { Placement } from "./Placement";
import MemoizedSprite from "@/components/object-graphics/Sprite";
import { TILES } from "@/helpers/tiles";

export class BulletDropboxPlacement extends Placement {
  dropsBulletOnCollide(forBody) {
    return (
      forBody.type === PLACEMENT_TYPE_HERO &&
      this.level.inventory.has(PLACEMENT_TYPE_BULLET_PICKUP)
    )
  }

  renderComponent() {
    return <MemoizedSprite frameCoord={TILES.BULLET_DROPBOX} />
  }
}

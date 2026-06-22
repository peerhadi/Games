import { CELL_SIZE, DIRECTION_DOWN, DIRECTION_UP, PLACEMENT_TYPE_CIABATTA } from "@/helpers/consts";
import { BodyPlacement } from "./BodyPlacement";
import ElevatedSprite from "@/components/object-graphics/ElevatedSprite";
import { TILES } from "@/helpers/tiles";

export class BulletPlacement extends BodyPlacement {
  constructor(properties, level) {
    super(properties, level);
    this.hasMovedUp = false;
    this.movingPixelsDirection = DIRECTION_UP;
    this.tickBetweenMovesInInterval = 40;
    this.ticksUntilNextMove = this.tickBetweenMovesInInterval
  }

  tickAttemptAiMove() {
    if (this.isSolidAtNextPosition(this.movingPixelsDirection)) {
      return
    }
    if (this.movingPixelsRemaining === 0) {
      this.ticksUntilNextMove = this.tickBetweenMovesInInterval;
      this.movingPixelsRemaining = CELL_SIZE;
      this.movingPixelsDirection = this.movingPixelsDirection;
      this.updateFacingDirection();
      this.updateWalkFrame()
    }
  }

  damagesBodyOnCollide(forBody) {
    if (forBody.type === PLACEMENT_TYPE_CIABATTA) {
      this.level.deletePlacement(this);
      return true
    }
    return false
  }

  renderComponent() {
    return <ElevatedSprite frameCoord={TILES.BULLET} pxAboveGround={2} />
  }
}

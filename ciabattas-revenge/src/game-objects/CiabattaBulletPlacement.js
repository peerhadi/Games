import { CELL_SIZE, DIRECTION_LEFT, PLACEMENT_TYPE_HERO } from "@/helpers/consts";
import ElevatedSprite from "@/components/object-graphics/ElevatedSprite";
import { TILES } from "@/helpers/tiles";
import { BodyPlacement } from "./BodyPlacement";

export class CiabbattaBulletPlacement extends BodyPlacement {
  constructor(properties, level) {
    super(properties, level);

    this.pattern = properties.pattern || [DIRECTION_LEFT]
    this.movingPixelsDirection = properties.pattern[0] || DIRECTION_LEFT
    this.movesLeft = 35;
    this.tickBetweenMovesInInterval = 7
    this.ticksUntilNextMove = this.tickBetweenMovesInInterval
  }
  tickAttemptAiMove() {
    if (this.movesLeft === 0) {
      this.level.deletePlacement(this)
    }
    if (this.movingPixelsRemaining === 0) {
      this.ticksUntilNextMove = this.tickBetweenMovesInInterval;
      this.movingPixelsRemaining = CELL_SIZE;
      this.movingPixelsDirection = this.pattern[0]
      this.pattern.push(this.pattern.shift())
      this.movesLeft--
      this.updateFacingDirection();
      this.updateWalkFrame()
    }
  }

  tick() {
    this.ticksUntilNextMove--
    if (this.ticksUntilNextMove <= 0) {
      this.tickMovingPixelProgress()
      this.tickAttemptAiMove()
    }
  }

  damagesBodyOnCollide(forBody) {
    if (forBody.type === PLACEMENT_TYPE_HERO) {
      this.level.setDeathOutcome(this.type)
      return true
    }
    return false
  }

  renderComponent() {
    return <ElevatedSprite frameCoord={TILES.CIABATTA_BLAST} pxAboveGround={6} />
  }
}

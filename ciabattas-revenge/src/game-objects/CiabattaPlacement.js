import CiabattaBody from "@/components/object-graphics/CiabattaBody";
import GroundEnemyPlacement from "./GroundEnemyPlacement";
import { TILES } from "@/helpers/tiles";
import { CELL_SIZE, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, PLACEMENT_TYPE_BULLET, PLACEMENT_TYPE_BULLET_PICKUP, PLACEMENT_TYPE_CIABATTA_BULLET, PLACEMENT_TYPE_ROAMING_ENEMY, PLACEMENT_TYPE_WARNING } from "@/helpers/consts";

const ATTACKS = {
  TACKLE: "TACKLE",
  SPAWN_BULLET: "SPAWN_BULLET",
  SPAWN: "SPAWN",
  BLAST: "BLAST"
}
const PAIN_FRAMES_LENGTH = 20;
const DEATH_FRAMES_LENGTH = 140;

export class CiabattaPlacement extends GroundEnemyPlacement {
  constructor(properties, level) {
    super(properties, level)
    this.tickBetweenMovesInInterval = 40;
    this.ticksUntilNextMove = this.tickBetweenMovesInInterval;
    this.turnsAroundAtWater = true;
    this.interactsWithGround = true;
    this.normalMovesRemaining = 4;
    this.hp = 3;
    this.painFramesRemaining = 0;
    this.currentAttack = null
    this.deathFramesUntilDisappear = 0;
    this.spawnsBullets = properties.spawnsBullets ?? false
  }

  tickAttemptAiMove() {
    if (this.level.enableEditing) {
      return
    }
    this.checkForOverlapWithHero();
    if (this.deathFramesUntilDisappear > 0) {
      this.deathFramesUntilDisappear -= 1;
      if (this.deathFramesUntilDisappear === 0) {
        this.level.deletePlacement(this)
      }
      return;
    }
    if (this.painFramesRemaining > 0) {
      this.painFramesRemaining -= 1;
      return;
    }
    if (this.ticksUntilNextMove > 0) {
      this.ticksUntilNextMove -= 1;
      return;
    }

    if (this.currentAttack) {
      this.workOnAttackFrame();
      return;
    }
    const direction = this.movingPixelsDirection;
    if (this.isSolidAtNextPosition(direction)) {
      this.switchDirection();
      return;
    }

    if (this.movingPixelsRemaining === 0) {
      this.ticksUntilNextMove = this.tickBetweenMovesInInterval;
      this.movingPixelsRemaining = CELL_SIZE;
      this.movingPixelsDirection = direction;
      this.updateFacingDirection();
      this.updateWalkFrame()
    }
  }

  onPostMove() {
    if (this.normalMovesRemaining === 0) {
      this.normalMovesRemaining = 4;
      this.startAttack();
      return;
    }
    this.normalMovesRemaining -= 1;
  }
  startAttack() {
    const possibleNextAttacks = [ATTACKS.SPAWN, ATTACKS.TACKLE, ATTACKS.SPAWN_BULLET, ATTACKS.BLAST];
    const next =
      possibleNextAttacks[
      Math.floor(Math.random() * possibleNextAttacks.length)
      ];
    if (next === ATTACKS.TACKLE) {
      this.currentAttack = {
        type: ATTACKS.TACKLE,
        framesRemaining: 150,
        returnToY: this.y,
        returnToX: this.x,
      }
    }
    if (next === ATTACKS.BLAST) {
      this.currentAttack = {
        type: ATTACKS.BLAST,
        framesRemaining: 100,
        returnToY: this.y,
        returnToX: this.x,
      }
    }

    if (next === ATTACKS.SPAWN) {
      this.currentAttack = {
        type: ATTACKS.SPAWN,
        framesRemaining: 270,
        returnToY: this.y
      }
    }

    if (next === ATTACKS.SPAWN_BULLET) {
      this.currentAttack = {
        type: ATTACKS.SPAWN_BULLET,
        framesRemaining: 120,
      }
    }
  }

  workOnAttackFrame() {
    if (this.currentAttack.framesRemaining === 0) {
      this.currentAttack = null;
      return;
    }

    if (this.currentAttack.type === ATTACKS.TACKLE) {
      this.handleTackleAttackFrame();
    }

    if (this.currentAttack.type === ATTACKS.SPAWN) {
      this.handleSpawnAttackFrame();
    }

    if (this.currentAttack.type === ATTACKS.SPAWN_BULLET) {
      this.workOnSpawnBulletBehavior()
    }
    if (this.currentAttack.type === ATTACKS.BLAST) {
      this.workOnBlastBehavior()
    }
    this.currentAttack.framesRemaining -= 1;
  }

  workOnBlastBehavior() {
    if (this.currentAttack.framesRemaining === 100) {
      this.createBlast()
    }
  }

  createBlast() {
    const patterns = [
      [DIRECTION_LEFT],
      [DIRECTION_RIGHT],
      [DIRECTION_DOWN],
      [DIRECTION_LEFT, DIRECTION_DOWN, DIRECTION_DOWN],
      [DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_DOWN],
    ]

    patterns.forEach((p) => {
      this.level.addPlacement({
        type: PLACEMENT_TYPE_CIABATTA_BULLET,
        x: this.x,
        y: this.y,
        pattern: p
      })
    })
  }

  handleSpawnAttackFrame() {
    const { framesRemaining } = this.currentAttack;

    if (framesRemaining === 270) {
      this.enemies = [
        {
          type: PLACEMENT_TYPE_ROAMING_ENEMY,
          x: this.level.heroRef.x,
          y: this.level.heroRef.y + 2,
        },
        {
          type: PLACEMENT_TYPE_ROAMING_ENEMY,
          x: this.level.heroRef.x + 2,
          y: this.level.heroRef.y,
        },
        {
          type: PLACEMENT_TYPE_ROAMING_ENEMY,
          x: this.level.heroRef.x - 2,
          y: this.level.heroRef.y,
        },
      ].filter(p => {
        return p.x > 0 && p.x <= this.level.tilesWidth && p.y < this.level.tilesHeight && p.y > 0;
      })
      this.warningPlacement = []
      this.enemies.forEach(enemyConfig => {
        this.warningPlacement.push(this.level.addPlacement({
          type: PLACEMENT_TYPE_WARNING,
          x: enemyConfig.x,
          y: enemyConfig.y
        }));
      })

    }
    if (framesRemaining == 210) {
      this.warningPlacement.forEach(warning => {
        this.level.deletePlacement(warning)
      })
      this.enemies.forEach(enemyConfig => {

        this.level.addPlacement(enemyConfig);

      })
    }
    if (framesRemaining === 1) {
      this.level.placements.forEach(p => {
        if (p.type == PLACEMENT_TYPE_ROAMING_ENEMY) {
          this.level.deletePlacement(p)
        }
      })
    }
  }

  workOnSpawnBulletBehavior() {
    if (this.currentAttack.framesRemaining === 120) {
      this.spawnBulletPickup()
    }
  }

  handleTackleAttackFrame() {
    const { framesRemaining, returnToY, returnToX } = this.currentAttack;
    if (framesRemaining === 150) {
      this.goToX = this.level.heroRef.x;
      this.goToY = this.level.heroRef.y - 1;

      this.warningPlacement = this.level.addPlacement({
        type: PLACEMENT_TYPE_WARNING,
        x: this.goToX,
        y: this.goToY,
      });
    }
    if (framesRemaining === 115) {
      this.level.deletePlacement(this.warningPlacement)
      this.x = this.goToX;
      this.y = this.goToY;
      this.handleCollisions()
      if (this.y < 1) {
        this.y = 1;
        this.handleCollisions()
      }
    }
    if (framesRemaining == 100) {
      this.y = this.y + 1;
      this.handleCollisions()
    }

    if (framesRemaining === 50) {
      this.y = returnToY;
      if (this.level.placements.find((p) => p.y === this.y && p.x === this.x)) {
        this.x = returnToX;
      }

      this.handleCollisions()
    }
  }
  spawnBulletPickup() {
    if (!this.spawnsBullets) {
      return false
    }

    const existingBullets = this.level.placements.filter((p) => {
      return p.type === PLACEMENT_TYPE_BULLET
    })

    if (existingBullets.length >= 2) {
      return;
    }

    const newPickup = [
      { x: 3, y: 5 },
      { x: 5, y: 3 },
      { x: 6, y: 7 },
      { x: 6, y: 6 },
      { x: 4, y: 4 },
    ][Math.floor(Math.random() * 5)]

    this.level.addPlacement({
      x: newPickup.x,
      y: newPickup.y,
      type: PLACEMENT_TYPE_BULLET_PICKUP
    })
  }
  takesDamage() {
    this.painFramesRemaining = PAIN_FRAMES_LENGTH;
    this.hp -= 1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.deathFramesUntilDisappear = DEATH_FRAMES_LENGTH
    }
  }

  getFrame() {

    if (this.hp <= 0) {
      return TILES.CIABATTA_DEAD
    }
    if (this.painFramesRemaining > 0) {
      return TILES.CIABATTA_PAIN
    }
    if (this.currentAttack?.type === ATTACKS.TACKLE) {
      return TILES.CIABATTA_TELEPORT;
    }
    if (this.currentAttack?.type === ATTACKS.SPAWN || this.movingPixelsRemaining > 0) {
      return TILES.CIABATTA1
    }
    return TILES.CIABATTA2
  }
  renderComponent() {
    return <CiabattaBody frameCoord={this.getFrame()} />
  }

}

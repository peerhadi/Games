import { events } from "./Events";
import { Vector2 } from "./Vector2";

export class GameObject {
  constructor({ position }) {
    this.position = position || new Vector2(0, 0)
    this.children = [];
    this.parent = null;
    this.hasReadyBeenCalled = false;
    this.isSolid = false;
    this.drawLayer = null;
  }

  stepEntry(delta, root) {
    this.children.forEach((child) => child.stepEntry(delta, root))

    if (!this.hasReadyBeenCalled) {
      this.hasReadyBeenCalled = true;
      this.ready();
    }

    this.step(delta, root)
  }

  ready() {

  }

  step(_delta) {

  }

  draw(ctx, x, y) {
    const drawPosX = x + this.position.x
    const drawPosY = y + this.position.y
    this.drawImage(ctx, drawPosX, drawPosY);
    const orderedChildren = this.getDrawChildrenOrdered()
    orderedChildren.forEach((child) => child.draw(ctx, drawPosX, drawPosY))
  }

  getDrawChildrenOrdered() {
    return [...this.children].sort((a, b) => {
      if (b.drawLayer === 'FLOOR') {
        return 1;
      }

      return a.position.y > b.position.y ? 1 : -1
    })
  }

  drawImage(_ctx, _drawPosX, _drawPosY) {

  }

  addChild(gameObject) {
    gameObject.parent = this;
    this.children.push(gameObject)
  }

  removeChild(gameObject) {
    events.unsubscribe(gameObject)
    this.children = this.children.filter(g => {
      return gameObject !== g
    })
  }

  destroy() {
    this.children.forEach(child => {
      child.destroy();
    })

    this.parent.removeChild(this)
  }
}

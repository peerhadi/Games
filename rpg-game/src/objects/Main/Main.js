import { GameObject } from "../../GameObject";
import { Inventory } from "../Inventory/Inventory";
import { Input } from "../../Input";
import { Camera } from "../../Camera";
import { events } from "../../Events";
import { SpriteTextString } from "../SpriteTextString/SpriteTextString";
import { storyFlags } from "../../StoryFlags";

export class Main extends GameObject {
  constructor() {
    super({});
    this.level = null;
    this.input = new Input();
    this.camera = new Camera();
  }

  ready() {

    const inventory = new Inventory();
    this.addChild(inventory)

    events.on("HERO_REQUESTS_ACTION", this, (withObject) => {
      if (typeof withObject.getContent === "function") {
        const content = withObject.getContent();

        if (!content) return;

        if(content.addsFlag){
          storyFlags.add(content.addsFlag)
        }
        const textbox = new SpriteTextString({
          string: content.string,
          portraitFrame: content.portraitFrame
        });

        this.addChild(textbox)

        events.emit("START_TEXT_BOX")
        const endingSub = events.on("END_TEXT_BOX", this, () => {
          textbox.destroy();
          events.off(endingSub)
        })
      }
    })

    events.on("CHANGE_LEVEL", this, newLevelInstance => {
      this.setLevel(newLevelInstance)
    })
  }

  setLevel(newLevelInstance) {

    if (this.level) {
      this.level.destroy();
    }

    this.level = newLevelInstance;
    this.addChild(this.level)
  }

  drawBackground(ctx) {
    this.level?.background.drawImage(ctx, 0, 0)
  }

  drawObjects(ctx) {
    this.children.forEach(child => {
      if (child.drawLayer !== 'HUD') {
        child.draw(ctx, 0, 0)
      }
    })
  }

  drawForeground(ctx) {
    this.children.forEach(child => {
      if (child.drawLayer === 'HUD') {
        child.draw(ctx, 0, 0)
      }
    })
  }
}

import MemoizedSprite from "@/components/object-graphics/Sprite";
import { TILES } from "@/helpers/tiles";
import { Placement } from "./Placement";

export class HeroSpawnPlacement extends Placement {
  constructor(properties, level){
    super(properties, level)
  }
  setDontShow(bool){
    this.dontShow = bool
  }
  canBeDeleted(){
    return false
  }
  renderComponent() {
    return <MemoizedSprite frameCoord={TILES.HERO_SPAWN} />
  }
}

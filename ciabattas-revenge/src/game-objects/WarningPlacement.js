import MemoizedSprite from "@/components/object-graphics/Sprite";
import { Placement } from "./Placement";
import { TILES } from "@/helpers/tiles";

export class WarningPlacement extends Placement {
  renderComponent(){
    return <MemoizedSprite frameCoord={TILES.WARNING}/>
  }
}

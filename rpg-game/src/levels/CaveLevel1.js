import { events } from "../Events";
import { gridCells } from "../helpers/grid";
import { Exit } from "../objects/Exit/Exit";
import { Hero } from "../objects/Hero/Hero";
import { Level } from "../objects/Level/Level";
import { Npc } from "../objects/Npc/Npc";
import { Rod } from "../objects/Rod/Rod";
import { resources } from "../Resources";
import { Sprite } from "../Sprites";
import { TALKED_TO_A, TALKED_TO_B } from "../StoryFlags";
import { Vector2 } from "../Vector2";
import { OutdoorLevel1 } from "./OutDoorLevel1";

const DEFAULT_HERO_POSITION = new Vector2(gridCells(6), gridCells(5))

export class CaveLevel1 extends Level {
  constructor(params = {}) {
    super({});

    this.background = new Sprite({
      resource: resources.images.cave,
      frameSize: new Vector2(320, 180)
    })
    this.heroStartPosition = params.heroPosition ?? DEFAULT_HERO_POSITION

    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero)

    const exit = new Exit(gridCells(3), gridCells(5));
    this.addChild(exit);


    const ground = new Sprite({
      resource: resources.images.caveGround,
      frameSize: new Vector2(320, 180)
    })

    this.addChild(ground)
    const rod = new Rod(gridCells(9), gridCells(6))
    this.addChild(rod)

    const npc1 = new Npc(gridCells(5), gridCells(5), {
      content: [
        {
          string: "I just can't stand that guy.",
          requires: [TALKED_TO_B],
          bypass: [TALKED_TO_A],
          addsFlag: TALKED_TO_A,
        },
        {
          string: "He is just the worst.",
          requires: [TALKED_TO_A]
        },
        {
          string: 'Grumble grumble, Another day at work.'
        }
      ],
      portraitFrame: 1
    });
    this.addChild(npc1)

    const npc2 = new Npc(gridCells(8), gridCells(5), {
      content: [
        {
          string: 'What a wonderful day at work in the cave!',
          requires: [],
          addsFlag: TALKED_TO_B
        }],
      portraitFrame: 0,
    });
    this.addChild(npc2)


    this.walls = new Set();
    [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
    [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8],
    [18, 7], [18, 6], [18, 5], [18, 4], [18, 3], [18, 2], [18, 1],
    [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [3,1], [4,1], [2,4], [3,4], [5,3], [6,3], [8,3], [6,4], [7,4], [9,1], [12,2], [13,2], [13,3], [15,2], [16,2], [12,5], [13, 5], [11,6], [12,6], [13,6], [14,6], [16,5], [6,6], [7,6], [8,6] ].map(([x, y]) => {
      this.walls.add(`${x * 16},${y * 16}`)

    })
  }

  ready() {
    events.on("HERO_EXITS", this, () => {
      events.emit('CHANGE_LEVEL', new OutdoorLevel1({
        heroPosition: new Vector2(gridCells(6), gridCells(4))
      }))
    })
  }
}

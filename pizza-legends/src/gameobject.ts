import { OverworldEvent } from "./overworldEvent";
import { OverworldMap } from "./overworldmap";
import { State } from "./person";
import { Sprite } from "./sprite";
export type Behavior = Record<string, any>

export class GameObject {
    x: number;
    y: number;
    sprite: Sprite;
    direction: State;
    isMounted: Boolean;
    id: null | string;
    behaviorLoop: Array<Behavior>;
    behaviorLoopIndex: number;
    isStanding?: boolean;
    retryTimeout: any;
    constructor(config: any) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src ?? '/images/characters/people/hero.png',

        })
        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.direction = config.direction || 'down'
        this.retryTimeout = null;
    }

    mount(map: OverworldMap) {
        this.isMounted = true;

        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    async doBehaviorEvent(map: OverworldMap) {
        if (this.id == null) return;
        if (this.behaviorLoop.length === 0) return;
        if (map.cutscenePlaying) {
            if(this.retryTimeout) {
                clearTimeout(this.retryTimeout)
            }

            setTimeout(() => {
                this.doBehaviorEvent(map)
            }, 1000)
            return;
        }
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;
    

        const eventHandler = new OverworldEvent(map, eventConfig);
        await eventHandler.init();

        this.behaviorLoopIndex++;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }
        this.doBehaviorEvent(map);
    }
}

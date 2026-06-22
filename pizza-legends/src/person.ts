import { Behavior, GameObject } from "./gameobject";
import { utils } from "./utils";
export type State = 'up' | 'down' | 'left' | 'right'
export class Person extends GameObject {
    movingProgressRemaining: number;
    directionUpdate: Record<string, Array<any>>;
    isPlayerControlled: boolean;
    isStanding: boolean;
    talking: Array<Record<string, Array<Behavior>>>
    intentPosition: Behavior | null;

    constructor(config: any) {
        super(config);
        this.intentPosition = null;
        this.movingProgressRemaining = 0;
        this.isPlayerControlled = config.isPlayerControlled || false;

        this.directionUpdate = {
            'up': ['y', -1],
            'down': ['y', 1],
            'left': ['x', -1],
            'right': ['x', 1],
        }

        this.isStanding = false;

        this.talking = config.talking || [];
    }

    update(state: Record<string, any>) {
        if (this.movingProgressRemaining > 0) {
            this.updatePosition()
        } else {
            if (!state.map.cutscenePlaying && state.arrow && this.isPlayerControlled) {
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow
                })
            }
            this.updateSprite(state);

        }

    }



    startBehavior(state: Record<string, any>, behavior: Record<string, any>) {
        if (!this.isMounted) return;
        this.direction = behavior.direction;
        if (behavior.type === 'walk') {
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
                behavior.retry && setTimeout(() => {
                    this.startBehavior(state, behavior)
                }, 10)
                return
            }
            this.movingProgressRemaining = 16


            const intentPosition = utils.nextPosition(this.x, this.y, this.direction)
            this.intentPosition = [
                intentPosition.x,
                intentPosition.y,
            ]
            this.updateSprite(state);


        }
        if (behavior.type === 'stand') {
            this.isStanding = true;
            setTimeout(() => {
                utils.emitEvent('PersonStandComplete', {
                    id: this.id
                })
                this.isStanding = false;
            }, behavior.time)
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        if (property === 'x') {
            this.x += change;
        } else {
            this.y += change;
        }

        this.movingProgressRemaining--;
        if (this.movingProgressRemaining === 0) {
            this.intentPosition = null;
            utils.emitEvent('PersonWalkingComplete', {
                id: this.id
            })
        };

    }

    updateSprite(state: Record<string, State>) {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation('walk_' + this.direction)
            return;
        }
        this.sprite.setAnimation('idle_' + this.direction)
    }
}

import { Combatant } from "./battle/combatant";
import { Behavior, GameObject } from "./gameobject";
import { Sprite } from "./sprite";
import { playerState } from "./state/playerState";

export class PizzaStone extends GameObject {
    sprite: Sprite;
    storyFlag: string;
    talking: Array<Behavior>;
    pizzas: Array<string>;
    constructor(config: Record<string, any>) {
        super(config);
        this.sprite = new Sprite({
            gameObject: this,
            src: '/images/characters/pizza-stone.png',
            animations: {
                'used-down': [[0, 0]],
                'unused-down': [[1, 0]],
            },
            currentAnimation: 'used-down'
        });
        this.pizzas = config.pizzas;
        this.storyFlag = config.storyFlag;

        this.talking = [
            {
                required: [this.storyFlag],
                events: [
                    { type: 'textMessage', text: 'You have already used this.' }
                ]
            },
            {
                events: [
                    { type: 'textMessage', text: 'Approaching the legendary pizza stone...' },
                    { type: 'craftingMenu', pizzas: this.pizzas },
                    { type: 'addStoryFlag', flag: this.storyFlag }
                ]
            }
        ]
    }

    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag] ? 'used-down' : 'unused-down';
    }


}

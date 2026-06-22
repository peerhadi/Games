import { resolve } from "path";
import { Behavior } from "./gameobject";
import { OverworldMap, OverworldMaps } from "./overworldmap";
import { TextMessage } from "./textmessage";
import { utils } from "./utils";
import { SceneTransition } from "./scenetransition";
import { Battle } from "./battle/battle";
import { enemies } from "./content/enemies";
import { PauseMenu } from "./PauseMenu";
import { playerState } from "./state/playerState";
import { CraftingMenu } from "./craftingMenu";

export class OverworldEvent {
    map: OverworldMap;
    event: Behavior;

    constructor(map: OverworldMap, event: Behavior) {
        this.map = map;
        this.event = event;
    }


    stand(resolve: Function) {
        const who = this.map.gameObjects[this.event.who];

        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        })

        const completeHandler = (e: any) => {
            if (e.detail.id === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonStandComplete", completeHandler)
    }

    walk(resolve: Function) {
        const who = this.map.gameObjects[this.event.who];

        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true
        })

        const completeHandler = (e: any) => {
            if (e.detail.id === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonWalkingComplete", completeHandler)

    }


    textMessage(resolve: Function) {
        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects['hero'].direction);
        }
        if (!this.event.text) return;
        const message = new TextMessage(
            this.event.text,
            () => resolve(),
        )
        message.init(document.querySelector('.game-container') as HTMLElement)
    }

    changeMap(resolve: Function) {
        Object.values(this.map.gameObjects).forEach(obj => {
            obj.isMounted = false;
        })
        const sceneTransition = new SceneTransition();

        sceneTransition.init(document.querySelector('.game-container') as HTMLElement, () => {
            if (!this.event.map) return;
            this.map.overworld?.startMap(new OverworldMap(OverworldMaps[this.event.map]), {
                x: this.event.x,
                y: this.event.y,
                direction: this.event.direction,
            });
            resolve();
            sceneTransition.fadeOut()
        })
    }

    battle(resolve: Function) {
        const enemyId = this.event.enemyId
        const battle = new Battle({
            enemy: enemies[enemyId],
            onComplete: (didWin: Boolean) => {
                resolve(didWin ? "WON_BATTLE" : 'LOST_BATTLE');
            }
        })
        battle.init(document.querySelector('.game-container') as HTMLElement)
    }

    pause(resolve: Function) {
        this.map.isPaused = true;
        if (!this.map.overworld?.progress) return;
        const menu = new PauseMenu({
            progress: this.map.overworld.progress,
            onComplete: () => {
                resolve();
                this.map.isPaused = false;
                this.map.overworld?.startGameLoop();
            }
        });

        menu.init(document.querySelector('.game-container') as HTMLElement)
    }

    addStoryFlag(resolve: Function) {
        playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    craftingMenu(resolve: Function) {
        const menu = new CraftingMenu({
            pizzas: this.event.pizzas,
            onComplete: () => resolve()
        })

        menu.init(document.querySelector('.game-container') as HTMLElement);

    }

    init() {


        return new Promise(resolve => {
            const type = this.event.type;
            if (type === 'walk') {
                this.walk(resolve)
            } else if (type === 'stand') {
                this.stand(resolve)
            } else if (type === 'changeMap') {
                this.changeMap(resolve)
            } else if (type === 'battle') {
                this.battle(resolve)
            } else if (type === 'pause') {
                this.pause(resolve)
            } else if (type === 'addStoryFlag') {
                this.addStoryFlag(resolve)
            } else if (type === 'craftingMenu') {
                this.craftingMenu(resolve)
            } else {
                this.textMessage(resolve)
            }

        })
    }
}

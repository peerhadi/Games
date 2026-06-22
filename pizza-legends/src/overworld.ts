import { DirectionInput } from "./DirectionInput";
import { Hud } from "./Hud";
import { TitleScreen } from "./battle/TitleScreen";
import { Behavior } from "./gameobject";
import { KeyPressListener } from "./keypressListener";
import { OverworldMap, OverworldMaps } from "./overworldmap";
import { Progress } from "./progress";
export class Overworld {
    element: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    map?: OverworldMap;
    directionInput?: DirectionInput;
    hud?: Hud;
    progress?: Progress;
    titleScreen?: TitleScreen;
    constructor(element: HTMLElement) {
        this.element = element;
        const canvas = element.querySelector('.game-canvas');
        if (!canvas) {
            throw new Error("Canvas not found in DOM");
        }
        this.canvas = canvas as HTMLCanvasElement;
        const ctx = this.canvas?.getContext('2d')
        if (!ctx) {
            throw new Error("Could not retreive context from canvas");
        }
        this.ctx = ctx;
    }
    gameLoopStepWork() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const cameraPerson = this.map?.gameObjects.hero;
        if (!cameraPerson) return;
        if (this.map) {
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput?.direction,
                    map: this.map,
                })
            })
            this.map.drawLowerImage(this.ctx, cameraPerson)
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y
            }).forEach(object => {

                object.sprite.draw(this.ctx, cameraPerson)
            })
            this.map.drawUpperImage(this.ctx, cameraPerson)
        }
    }

    startGameLoop() {
        let previousMs: any;
        const step = 1 / 60;
        const stepFn = (timestampMs: number) => {
            if (this.map?.isPaused) {
                return
            }
            if (previousMs === undefined) {
                previousMs = timestampMs;
            }
            let delta = (timestampMs - previousMs) / 1000;
            while (delta >= step) {
                this.gameLoopStepWork();
                delta -= step
            }
            previousMs = timestampMs - delta * 1000;
            requestAnimationFrame(stepFn)
        }

        requestAnimationFrame(stepFn);
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            this.map?.checkForActionPause();
        })

        new KeyPressListener("Escape", () => {
            if (!this.map?.cutscenePlaying) {
                this.map?.startCutscene([
                    { type: 'pause' }
                ])
            }

        })
    }

    bindHeroPositionCheck() {
        document.addEventListener('PersonWalkingComplete', (e: any) => {
            if (e.detail.id === 'hero') {
                if (!this.map) return;
                this.map.checkForFootstepCustscene();
            }
        })
    }

    startMap(map: OverworldMap, heroInitialState: Behavior | null = null) {
        this.map = map;
        this.map.overworld = this;
        this.map.mountObjects()

        if (heroInitialState) {
            const { hero } = this.map.gameObjects;
            hero.x = heroInitialState.x;
            hero.y = heroInitialState.y;
            hero.direction = heroInitialState.direction;
        }
        if (!this.progress) return;
        this.progress.mapId = map.id;
        this.progress.startingHeroX = map.gameObjects.hero.x;
        this.progress.startingHeroY = map.gameObjects.hero.y;
        this.progress.startingHeroDirection = map.gameObjects.hero.direction;

    }



    async init() {
        this.progress = new Progress();
        this.titleScreen = new TitleScreen({
            progress: this.progress
        });

        const useSaveFile = await this.titleScreen.init(document.querySelector('.game-container') as HTMLElement);
        let heroInitialState = null;
        if (useSaveFile) {
            this.progress.load();
            heroInitialState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            }
        }
        this.hud = new Hud();
        this.hud.init(document.querySelector('.game-container') as HTMLElement);

        this.startMap(new OverworldMap(OverworldMaps[this.progress.mapId]), heroInitialState)
        this.directionInput = new DirectionInput()
        this.directionInput.init()

        this.startGameLoop()
        this.bindActionInput();
        this.bindHeroPositionCheck()

    }
}

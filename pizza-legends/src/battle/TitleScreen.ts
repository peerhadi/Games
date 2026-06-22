import { Behavior } from "../gameobject";
import { Progress } from "../progress";
import { KeyboardMenu } from "./keyboardMenu";

export class TitleScreen {
    element?: HTMLElement;
    keyboardMenu?: KeyboardMenu;
    progress: Progress
    constructor({ progress }: Record<string, Progress>) {
        this.progress = progress;
    }

    getOptions(resolve: Function): Array<Behavior> {
        const saveFile = this.progress.getSaveFile();
        console.log(saveFile)
        return [
            {
                label: "New Game",
                description: 'Start a new pizza adventure!',
                handler: () => {
                    this.close();
                    resolve(null);
                }
            },
            saveFile ? {
                label: 'Continue Game',
                description: "Resume your adventure!",
                handler: () => {
                    this.close();
                    resolve(saveFile);
                }
            } : {label: 'nothing'}
        ].filter(x => x.label != 'nothing');
    }

    close() {
        this.keyboardMenu?.end();
        this.element?.remove();

    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('TitleScreen');
        this.element.innerHTML = (`
            <img class="TitleScreen_logo" src="/images/logo.png" alt="Pizza Legends" />
        `)
    }

    init(container: HTMLElement) {
        return new Promise(resolve => {
            this.createElement();
            if (!this.element) return;
            container.appendChild(this.element);
            this.keyboardMenu = new KeyboardMenu();
            this.keyboardMenu.init(this.element)
            this.keyboardMenu.setOptions(this.getOptions(resolve))
        })
    }
}

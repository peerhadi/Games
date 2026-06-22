import { container } from "webpack";
import { KeyboardMenu } from "./battle/keyboardMenu";
import { KeyPressListener } from "./keypressListener";
import { utils } from "./utils";
import { playerState } from "./state/playerState";
import { Pizzas } from "./content/pizzas";
import { Progress } from "./progress";

type Props = {
    onComplete: Function
    progress: Progress;
}

export class PauseMenu {
    onComplete: Function;
    element?: HTMLElement;
    keyboardMenu?: KeyboardMenu;
    esc?: KeyPressListener;
    progress: Progress;
    constructor({ progress, onComplete }: Props) {
        this.onComplete = onComplete;
        this.progress = progress
    }

    getOptions(pageKey: string) {
        if (pageKey === 'root') {

            const lineupPizzas = playerState.lineup.map((id: string) => {
                const { pizzaId } = playerState.pizzas[id];
                const base = Pizzas[pizzaId];

                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu?.setOptions(this.getOptions(id))
                    }
                }
            })

            return [
                ...lineupPizzas,              
                {
                    label: 'Save',
                    description: 'Save your progress',
                    handler: () => {
                        this.progress.save();
                        this.close();
                    }
                },
                {
                    label: 'Close',
                    description: 'Close the pause menu',
                    handler: () => {
                        this.close()
                    }
                }
            ]
        };

        const unequipped = Object.keys(playerState.pizzas).filter(id => {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id => {
            const {pizzaId} = playerState.pizzas[id];
            const base = Pizzas[pizzaId];

            return {
                label: `Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id)
                    this.keyboardMenu?.setOptions(this.getOptions('root'))
                }
            }
        })

        return [
            ...unequipped,
            {
                label: 'Move to front',
                description: "Move this pizza to the front of the list",
                handler: () => {
                    playerState.moveToFront(pageKey)
                    this.keyboardMenu?.setOptions(this.getOptions('root'))
                }
            }, 
            {
                label: 'Back',
                description: 'Back to root menu',
                handler: () => {
                    this.keyboardMenu?.setOptions(this.getOptions('root'))
                }
            }
        ]
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu?.end();
        this.element?.remove();
        this.onComplete();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('PauseMenu');
        this.element.classList.add('overlayMenu');

        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `)
    }

    async init(container: HTMLElement) {
        this.createElement();
        if (!this.element) return;

        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })

        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions('root'));

        container.appendChild(this.element);

        await utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }
}

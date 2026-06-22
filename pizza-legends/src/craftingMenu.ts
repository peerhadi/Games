import { KeyboardMenu } from "./battle/keyboardMenu";
import { Pizzas } from "./content/pizzas";
import { playerState } from "./state/playerState";

type Props = {
    pizzas: Array<string>;
    onComplete: Function;
}
export class CraftingMenu {
    pizzas: Array<string>;
    onComplete: Function;
    element?: HTMLElement;
    keyboardMenu?: KeyboardMenu;

    constructor({ pizzas, onComplete }: Props) {
        this.pizzas = pizzas;
        this.onComplete = onComplete;

    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('CraftingMenu');
        this.element.classList.add('overlayMenu');

        this.element.innerHTML = (`
            <h2>Create a Pizza</h2>
        `)
    }

    getOptions(){
       return this.pizzas.map(id => {
            const base = Pizzas[id];
            return {
                label: base.name,
                description: base.description,
                handler: () =>  {
                    playerState.addPizza(id);

                    this.close();
                }
            }
        }) 
    }

    close() {
        this.keyboardMenu?.end();
        this.element?.remove();
        this.onComplete();
    }

    init(container: HTMLElement) {
        this.createElement();
        if(!this.element) return;

        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions())
        
        container.appendChild(this.element)
    }
}

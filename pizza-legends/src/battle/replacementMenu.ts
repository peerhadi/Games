import { Combatant } from "./combatant";
import { KeyboardMenu } from "./keyboardMenu";

export class ReplacementMenu {
    replacements: Array<Combatant>;
    onComplete: Function;
    keyboardMenu?: KeyboardMenu;
    constructor({ replacements, onComplete }: Record<string, any>) {
        this.replacements = replacements;
        this.onComplete = onComplete
    }

    decide() {
        this.menuSubmit(this.replacements[0]);
    }

    menuSubmit(replacement: Combatant) {
        this.keyboardMenu?.end();
        this.onComplete(replacement);
    }

    showMenu(container: HTMLElement) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container);
        this.keyboardMenu.setOptions(this.replacements.map(c => {
            return {
                label: c.properties.name,
                description: c.properties.description,
                handler: () => {
                    this.menuSubmit(c);
                }
            }
        }))


    }

    init(container: HTMLElement) {

        if (this.replacements[0].properties.isPlayerControlled)
            this.showMenu(container);
        else
            this.decide()
    }
}

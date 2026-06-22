import { actions } from "../content/actions";
import { Behavior } from "../gameobject";
import { Combatant } from "./combatant";
import { KeyboardMenu } from "./keyboardMenu";

export class SubmissionMenu {
    onCompelete: Function;
    caster: Combatant;
    enemy: Combatant;
    keyboardMenu?: KeyboardMenu;
    items: Record<string, any>;
    replacements: Array<Record<string, any>>;
    constructor(caster: Combatant, onCompelete: Function, enemy: Combatant, items: Array<Behavior>, replacements: Array<Record<string, any>>) {
        this.caster = caster;
        this.enemy = enemy;
        this.onCompelete = onCompelete;
        this.replacements = replacements;

        let quantityMap: Record<string, any> = {
        }
        items.forEach(item => {
            const actionId = item.actionId as string;
            if (item.team === caster.properties?.team) {
                let existing = quantityMap[actionId];

                if (existing) {
                    existing.quantity += 1;
                } else {
                    quantityMap[item.actionId] = {
                        actionId,
                        quantity: 1,
                        instanceId: item.instanceId
                    }
                }
            }
        });

        this.items = Object.values(quantityMap);

    }

    decide() {
        const action = this.caster.properties.actions[Math.floor(Math.random() * this.caster.properties.actions.length)] as string;
        if (actions[action]) {
            this.menuSubmit(actions[action])
        }
    }

    getPages() {
        const backOption = {
            label: 'Go back',
            description: 'Return to previous page',
            handler: () => {
                if (!this.keyboardMenu) return;
                this.keyboardMenu.setOptions(this.getPages().root);
            }
        }
        return {
            root: [
                {
                    label: 'Attack',
                    description: 'Choose an attack',
                    handler: () => {
                        if (!this.keyboardMenu) return;
                        this.keyboardMenu.setOptions(this.getPages().attacks)
                    }
                },
                {
                    label: 'Items',
                    description: 'Choose an item',
                    handler: () => {
                        if (!this.keyboardMenu) return;
                        this.keyboardMenu.setOptions(this.getPages().items)

                    }
                },
                {
                    label: 'Swap',
                    description: 'Change to another pizza',
                    handler: () => {
                        if (!this.keyboardMenu) return;
                        this.keyboardMenu.setOptions(this.getPages().replacements)

                    }
                }
            ],
            attacks: [
                ...this.caster.properties.actions.map((key: string) => {
                    const action = actions[key];
                    return {
                        label: action.name,
                        description: action.description,
                        handler: () => {
                            this.menuSubmit(action)
                        }
                    }
                }),
                backOption,
            ],
            items: [
                ...this.items.map((item: Behavior) => {
                    const action = actions[item.actionId];
                    return {
                        label: action.name,
                        description: action.description,

                        right: () => {
                            return 'x' + item.quantity;
                        },
                        handler: () => {
                            this.menuSubmit(action, item.instanceId)
                        }
                    }
                }),
                backOption
            ],
            replacements: [
                ...this.replacements.map(r => {
                    return {
                        label: r.properties.name,
                        description: r.properties.description,
                        handler: () => {
                            this.menuSubmitReplacement(r);
                        }
                    }
                }),
                backOption
            ]
        }
    }

    menuSubmitReplacement(replacement: Behavior) {
        this.keyboardMenu?.end();
        this.onCompelete({
            replacement
        })
    }

    menuSubmit(action: Record<string, any>, instanceId = null) {

        this.keyboardMenu?.end();

        this.onCompelete({
            action,
            target: action.targetType === 'friendly' ? this.caster : this.enemy,
            instanceId
        })
    }

    showMenu(container: HTMLElement) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container);
        this.keyboardMenu.setOptions(this.getPages().root)
    }

    init(container: HTMLElement) {
        if (this.caster.properties.isPlayerControlled) {
            this.showMenu(container)
        } else {
            this.decide();
        }
    }
}


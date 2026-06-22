import { utils } from "../utils";

export class PlayerState {
    pizzas: Record<string, any>;
    storyFlags: Record<string, any>;
    items: Array<Record<string, any>>;
    lineup: Array<string>;
    constructor() {
        this.pizzas = {
            "p1": {
                pizzaId: 's001',
                hp: 50,
                maxHp: 50,
                xp: 0,
                mapXp: 100,
                level: 1,
                status: null,
            },
        }
        this.lineup = ['p1']
        this.items = [
            { actionId: 'item_recoverHp', instanceId: 'item1' },
            { actionId: 'item_recoverHp', instanceId: 'item2' },
            { actionId: 'item_recoverHp', instanceId: 'item3' }
        ];

        this.storyFlags = {
        };
    }

    swapLineup(oldId: string, incomingId: string) {
        const oldIndex = this.lineup.indexOf(oldId);
        this.lineup[oldIndex] = incomingId;
        utils.emitEvent('LineupChanged', {});
    }

    addPizza(pizzaId: string) {
        const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999)
        this.pizzas[newId] = {
            pizzaId,
            hp: 50,
            maxHp: 50,
            xp: 0,
            maxXp: 100,
            level: 1,
            status: null
        }

        if (this.lineup.length < 3) {
            this.lineup.push(newId)
        }

        utils.emitEvent('LineupChanged', {});
    }

    moveToFront(futureFrontId: string) {

        this.lineup = this.lineup.filter(id => id != futureFrontId);
        this.lineup.unshift(futureFrontId);

        utils.emitEvent('LineupChanged', {});

    }
}

export const playerState: Record<string, any> = new PlayerState();


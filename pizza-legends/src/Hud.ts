import { Combatant } from "./battle/combatant";
import { Pizzas } from "./content/pizzas";
import { playerState } from "./state/playerState";

export class Hud {
    element?: HTMLElement;
    scoreboards: Array<Combatant>
    constructor() {
        this.scoreboards = [];
    }

    update() {
        this.scoreboards.forEach(s => {
            s.update(playerState.pizzas[s.properties.id]);
        });
    }

    createElement() {
        if(this.element){
            this.element.remove()
            this.scoreboards = [];
        }
        this.element = document.createElement('div');
        this.element.classList.add('Hud');

        playerState.lineup.forEach((key: string) => {
            const pizza = playerState.pizzas[key];
            const scoreboard = new Combatant({
                id: key,
                ...Pizzas[pizza.pizzaId],
                ...pizza,
            }, null)

            scoreboard.createElement();
            this.scoreboards.push(scoreboard)
            if (scoreboard.hudElement)
                this.element?.appendChild(scoreboard.hudElement)
        })

        this.update()
    }

    init(container: HTMLElement) {
        this.createElement();
        if (!this.element) return;

        container.appendChild(this.element)

        document.addEventListener('PlayerStateUpdated', () => {
            this.update()
        });

        document.addEventListener('LineupChanged', () => {
            this.createElement();
            if (!this.element) return;
            container.appendChild(this.element)
        })
    }
}


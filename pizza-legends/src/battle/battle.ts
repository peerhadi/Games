import { Pizzas } from "../content/pizzas";
import { Behavior } from "../gameobject";
import { playerState } from "../state/playerState";
import { utils } from "../utils";
import { BattleEvent } from "./battleEvent";
import { Combatant } from "./combatant";
import { Team } from "./team";
import { TurnCycle } from "./turnCycle";

export class Battle {
    element?: HTMLElement;
    combatants: Record<string, Combatant>;
    activeCombatants: Record<string, string | null>;
    turnCycle?: TurnCycle;
    items: Array<Behavior>;
    playerTeam?: Team;
    enemyTeam?: Team;
    onComplete: Function;
    enemy: Record<string, any>;
    useInstanceIds: Record<string, any>;
    constructor(config: Record<string, any>) {
        this.enemy = config.enemy;
        this.onComplete = config.onComplete;
        this.combatants = {
        }

        this.activeCombatants = {
            player: null,
            enemy: null
        }
        playerState.lineup.forEach((id: string) => {
            this.addCombatant(id, 'player', playerState.pizzas[id])
        });

        Object.keys(this.enemy.pizzas).forEach(id => {
            this.addCombatant(id, 'enemy', this.enemy.pizzas[id])
        })

        this.items = [];

        playerState.items.forEach((item: Record<string, any>) => {
            this.items.push({
                ...item,
                team: 'player'
            })
        })

        this.useInstanceIds = {};

    }

    addCombatant(id: string, team: string, config: Record<string, any>) {
        this.combatants[id] = new Combatant({
            ...Pizzas[config?.pizzaId],
            ...config,
            team,
            isPlayerControlled: team === 'player'
        }, this)

        this.activeCombatants[team] = this.activeCombatants[team] || id;
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('Battle')
        this.element.innerHTML = (
            `<div class="Battle_hero">
                <img src="${'/images/characters/people/hero.png'}" alt="hero"/>
            </div>
            <div class="Battle_enemy">
                <img src="${this.enemy.src}" alt=${this.enemy.name}/>
            </div>`
        )
    }

    init(container: HTMLElement) {
        this.createElement();
        if (!this.element) return;
        container.appendChild(this.element);


        this.playerTeam = new Team('player', 'Hero');
        this.enemyTeam = new Team('enemy', 'Bully')

        Object.keys(this.combatants).forEach(key => {
            let combatant = this.combatants[key];
            combatant.id = key;
            if (!this.element) return;
            combatant.init(this.element)

            if (combatant.properties.team === 'player') {
                this.playerTeam?.combatants.push(combatant);
            } else if (combatant.properties.team === 'enemy') {
                this.enemyTeam?.combatants.push(combatant);
            }
        })

        this.playerTeam.init(this.element);
        this.enemyTeam.init(this.element);

        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: (event: Record<string, any>) => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this);
                    battleEvent.init(resolve);
                })
            },
            onWinner: (winner: string) => {
                if (winner === 'player') {
                    Object.keys(playerState.pizzas).forEach((id: string) => {
                        const playerStatePizza = playerState.pizzas[id];
                        const combatant = this.combatants[id];

                        if (combatant) {
                            console.log(combatant.properties.hp)
                            combatant.properties.hp = combatant.properties.hp > 0 ? combatant.properties.hp : playerStatePizza.hp;
                            playerStatePizza.hp = combatant.properties.hp
                            playerStatePizza.xp = combatant.properties.xp;
                            playerStatePizza.maxHp = combatant.properties.maxHp;
                            playerStatePizza.level = combatant.properties.level;
                        }
                    })

                    playerState.items = playerState.items.filter((item: Record<string, any>) => {
                        return !this.useInstanceIds[item.instanceId];
                    })


                    utils.emitEvent('PlayerStateUpdated', {})
                }

                this.element?.remove();
                this.onComplete(winner === 'player');
            }
        })

        this.turnCycle.init();

    }
}

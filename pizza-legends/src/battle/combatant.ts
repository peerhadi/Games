import { Behavior } from "../gameobject";
import { utils } from "../utils";
import { Battle } from "./battle";

export class Combatant {
    battle: Battle | null;
    properties: Record<string, any>;
    hudElement?: HTMLElement;
    id: string | undefined;
    pizzaElement?: HTMLImageElement;
    constructor(config: Record<string, any>, battle: Battle | null) {
        this.battle = battle;
        this.properties = config;

        this.properties.hp = typeof(this.properties.hp) === 'undefined' ? this.properties.maxHp : this.properties.hp;
    }

    get hpPercent() {
        const percent = this.properties.hp / this.properties.maxHp * 100;
        return percent > 0 ? percent : 0;
    }

    get xpPercent() {
        return (this.properties.xp / this.properties.mapXp) * 100;
    }

    get isActive() {
        return this.battle?.activeCombatants[this.properties?.team] === this.id;
    }

    get givesXp(){
        return this.properties.level * 20;
    }

    createElement() {
        this.hudElement = document.createElement('div')
        this.hudElement.classList.add('Combatant');
        this.hudElement.setAttribute('data-combatant', this.id ? this.id : '');
        this.hudElement.setAttribute('data-team', this.properties?.team);
        
        this.hudElement.innerHTML = (`
            <p class="Combatant_name">${this.properties.name}</p>
            <p class="Combatant_level"></p>
            <div class="Combatant_character_crop">
                <img class="Combatant_character" alt="${this.properties.name}" src="${this.properties.src}" />
            </div>
            <img class="Combatant_type" src="${this.properties.icon}" alt="${this.properties.type}" />
            <svg viewBox="0 0 26 3" class="Combatant_life-container">
                <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
                <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
            </svg>
            <svg viewBox="0 0 26 2" class="Combatant_xp-container">
                <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
                <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
            </svg>
            <p class="Combatant_status"></p>
        `)

        this.pizzaElement = document.createElement('img');
        this.pizzaElement.classList.add("Pizza");
        this.pizzaElement.setAttribute('src', this.properties.src);
        this.pizzaElement.setAttribute('alt', this.properties.name);
        this.pizzaElement.setAttribute('data-team', this.properties?.team);

        this.properties.hpFills = this.hudElement.querySelectorAll('.Combatant_life-container > rect');
        this.properties.xpFills = this.hudElement.querySelectorAll('.Combatant_xp-container > rect');
    }
    update(changes: Record<string, any>) {

        Object.keys(changes).forEach(key => {
            this.properties[key] = changes[key];
        })
        if (!this.hudElement) return;
        if (!this.pizzaElement) return;
        const x = this.hudElement.querySelector('.Combatant_level') as HTMLElement;
        x.innerText = this.properties.level;

        this.hudElement.setAttribute('data-active', `${this.isActive}`);
        this.pizzaElement.setAttribute('data-active', `${this.isActive}`);

        this.properties.hpFills.forEach((rect: HTMLElement) => rect.style.width = `${this.hpPercent}%`)
        this.properties.xpFills.forEach((rect: HTMLElement) => rect.style.width = `${this.xpPercent}%`)

        const status = this.hudElement.querySelector('.Combatant_status') as HTMLElement;

        if (this.properties.status != null) {
            status.innerText = this.properties.status.type;
            status.style.display = 'block';
        } else {
            status.innerText = '';
            status.style.display = 'none';
        }
    }

    getPostEvents() {
        if (this.properties.status != null) {
            if (this.properties.status.type === 'saucy') {
                return [
                    { type: 'textMessage', text: "Feelin' saucy" },
                    { type: 'stateChange', recover: 5, onCaster: true }
                ]
            }
        }
        return [];
    }

    decrementStatus() {
        if (this.properties.status?.expiresIn > 0) {
            this.properties.status.expiresIn -= 1;
            if (this.properties.status.expiresIn == 0) {
                this.update({
                    status: null
                })

                return {
                    type: 'textMessage',
                    text: 'Status expired'
                }
            }
        }
    }

    init(container: HTMLElement) {
        this.createElement();
        if (!this.pizzaElement) return;
        if (!this.hudElement) return;

        container.appendChild(this.hudElement);
        container.appendChild(this.pizzaElement);
        this.update({})

    }

    getReplacedEvents(originalEvents: Array<Behavior>) {
        if (this.properties.status?.type === 'clumsy' && utils.randomFromArray([true, false, false])) {
            return [
                { type: 'textMessage', text: `${this.properties.name} flops over` }
            ]
        } else {
            return originalEvents;
        }
    }
}

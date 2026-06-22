import { TextMessage } from "../textmessage";
import { utils } from "../utils";
import { Battle } from "./battle";
import { battleAnimations } from "./battleAnimations";
import { Combatant } from "./combatant";
import { ReplacementMenu } from "./replacementMenu";
import { SubmissionMenu } from "./submissionmenu";

export class BattleEvent {
    event: Record<string, any>;
    battle: Battle;
    constructor(event: Record<string, any>, battle: Battle) {
        this.event = event;
        this.battle = battle;
    }

    textMessage(resolve: Function) {
        const text = this.event.text
            .replace('{CASTER}', this.event.caster?.properties.name)
            .replace('{TARGET}', this.event.target?.properties.name)
            .replace('{ACTION}', this.event.action?.name)
        const message = new TextMessage(
            text,
            () => {
                resolve()
            }
        );
        if (this.battle.element)
            message.init(this.battle.element)
    }

    submissionMenu(resolve: Function) {
        const { caster } = this.event;
        const submissionMenu = new SubmissionMenu(
            this.event.caster,
            (submission: any) => {
                resolve(submission)
            },
            this.event.enemy,
            this.battle.items,
            Object.values(this.battle.combatants).filter(c => {
                return c.id != caster.id && c.properties?.team === caster.properties?.team && c.properties.hp > 0
            })
        );
        if (this.battle.element)
            submissionMenu.init(this.battle.element)
    }

    async stateChange(resolve: Function) {
        const { caster, target, damage, recover, status } = this.event;
        let who = this.event.onCaster ? caster : target;

        if (damage) {
            target.update({
                hp: target.properties.hp - damage,
            })

            target.pizzaElement.classList.add('battle-damage-blink')
        }

        if (recover) {
            let newHp = who.properties.hp + recover;

            if (newHp > who.properties.maxHp) {
                newHp = who.properties.maxHp
            }

            who.update({
                hp: newHp
            })
        }

        if (status) {
            who.update({
                status: { ...status }
            })
        }

        if (status === null) {
            who.update({
                status: null
            })
        }

        await utils.wait(600);
        target.pizzaElement.classList.remove('battle-damage-blink')

        this.battle.playerTeam?.update();
        this.battle.enemyTeam?.update();

        resolve();

    }

    animation(resolve: Function) {
        const animation = this.event.animation;

        const fn = battleAnimations[animation === 'spin' ? 'spin' : 'glob'];
        fn(this.event, resolve);

    }

    async replace(resolve: Function) {
        const { replacement } = this.event;
        if (!replacement.properties) return;

        const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.properties.team] as string];
        this.battle.activeCombatants[replacement.properties.team] = null;
        prevCombatant.update({});
        await utils.wait(400);

        this.battle.activeCombatants[replacement.properties.team] = replacement.id;
        replacement.update({});
        await utils.wait(400)
        this.battle.playerTeam?.update();
        this.battle.enemyTeam?.update();

        resolve();

    }

    replacementMenu(resolve: Function) {
        const menu = new ReplacementMenu({
            replacements: Object.values(this.battle.combatants).filter((c: Combatant) => {
                return c.properties?.team === this.event.team && c.properties.hp > 0
            }),
            onComplete: (replacement: Combatant) => {
                resolve(replacement);
            }
        });
        if (this.battle.element)
            menu.init(this.battle.element);
    }

    giveXp(resolve: Function) {
        let amount = this.event.xp;
        const { combatant } = this.event;


        const step = () => {
            if (amount > 0) {
                amount--;
                combatant.properties.xp++;

                if (combatant.properties.xp === combatant.properties.maxXp) {
                    combatant.properties.xp = 0;
                    combatant.properties.maxHp = 100;
                    combatant.properties.level += 1;
                }

                combatant.update({});
                requestAnimationFrame(step);
                return;
            }
            resolve()
        }

        requestAnimationFrame(step)
    }

    init(resolve: Function) {
        const type = this.event.type;
        if (type === 'textMessage') {
            this.textMessage(resolve)
        } else if (type === 'submissionMenu') {
            this.submissionMenu(resolve)
        } else if (type === 'stateChange') {
            this.stateChange(resolve)
        } else if (type === 'animation') {
            this.animation(resolve)
        } else if (type === 'replace') {
            this.replace(resolve)
        } else if (type === 'giveXp') {
            this.giveXp(resolve)
        } else {
            this.replacementMenu(resolve);
        }
    }
}

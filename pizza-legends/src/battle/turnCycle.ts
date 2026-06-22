import { Battle } from "./battle";
type Props = {
    battle: Battle;
    onNewEvent: Function;
    onWinner: Function;
}
export class TurnCycle {
    battle: Battle;
    onNewEvent: Function;
    currentTeam: 'player' | 'enemy';
    onWinner: Function;
    constructor({ battle, onNewEvent, onWinner }: Props) {
        this.battle = battle;
        this.onWinner = onWinner;
        this.onNewEvent = onNewEvent;
        this.currentTeam = 'player';
    }

    async turn() {
        const casterId = this.battle.activeCombatants[this.currentTeam];
        if (!casterId) return;
        const caster = this.battle.combatants[casterId];

        const enemyId = this.battle.activeCombatants[caster.properties?.team === 'player' ? 'enemy' : 'player'];
        if (!enemyId) return;
        const enemy = this.battle.combatants[enemyId];


        const submission = await this.onNewEvent({
            type: "submissionMenu",
            caster,
            enemy,
        });
        if (submission.replacement) {
            await this.onNewEvent({
                type: 'replace',
                replacement: submission.replacement
            })

            await this.onNewEvent({
                type: 'textMessage',
                text: `Go get 'em, ${submission.replacement.properties.name}`
            });
            this.nextTurn()
            return;
        }

        if (submission.instanceId) {
            this.battle.useInstanceIds[submission.instanceId] = true;
            this.battle.items = this.battle.items.filter(i => i.instanceId != submission.instanceId)
        }

        const resultingEvents = caster.getReplacedEvents(submission.action.success);
        for (let i = 0; i < resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }

            await this.onNewEvent(event)
        }
        const targetDead = submission.target.properties.hp <= 0;
        if (targetDead) {
            await this.onNewEvent({
                type: 'textMessage', text: `${submission.target.properties.name} is ruined`
            })

            const playerActivePizzaId = this.battle.activeCombatants.player;
            const xp = submission.target.givesXp;
            if (submission.target.properties?.team === 'enemy' && playerActivePizzaId) {
                await this.onNewEvent({
                    type: 'textMessage',
                    text: `Gained ${xp} Xp`
                })
                await this.onNewEvent({
                    type: 'giveXp', xp, combatant: this.battle.combatants[playerActivePizzaId]
                })
            }
        }



        const winner = this.getWinningTeam();
        if (winner) {
            await this.onNewEvent({
                type: 'textMessage',
                text: 'Winner!'
            })

            this.onWinner(winner);

            return;
        }

        if (targetDead) {
            const replacement = await this.onNewEvent({
                type: 'replacementMenu',
                team: submission.target.properties.team,
            });


            await this.onNewEvent({
                type: 'replace',
                replacement,
            })

            await this.onNewEvent({
                type: 'textMessage', text: `${replacement.properties.name} appears!`
            })

        }

        const postEvents = caster.getPostEvents();

        for (let i = 0; i < postEvents.length; i++) {

            const event = {

                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }

            await this.onNewEvent(event);
        }

        const expiredEvent = caster.decrementStatus();

        if (expiredEvent) {
            await this.onNewEvent(expiredEvent)
        }
        this.nextTurn();
    }

    nextTurn() {
        this.currentTeam = this.currentTeam === 'player' ? 'enemy' : 'player';
        this.turn()

    }

    async init() {
        await this.onNewEvent({
            type: 'textMessage',
            text: `${this.battle.enemy.name} wants to throw down!`
        })

        this.turn();

    }

    getWinningTeam() {
        let aliveTeams: any = {};
        Object.values(this.battle.combatants).forEach(c => {
            if (c.properties.hp > 0) {
                aliveTeams[c.properties?.team] = true;
            }
        })

        if (!aliveTeams['player']) { return 'enemy' }
        if (!aliveTeams['enemy']) { return 'player' }

        return null;
    }
}


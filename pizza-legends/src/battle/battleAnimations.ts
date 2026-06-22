import { utils } from "../utils";

export const battleAnimations = {
    async spin(event: Record<string, any>, onCompelete: Function) {
        const element = event.caster.pizzaElement;
        const animationClassName = event.caster.properties?.team === 'player' ? 'battle-spin-right' : 'battle-spin-left';
        element.classList.add(animationClassName);

        element.addEventListener('animationend', () => {
            element.classList.remove(animationClassName)
        }, { once: true })

        await utils.wait(800);
        onCompelete();
    },

    async glob(event: Record<string, any>, onCompelete: Function) {
        const { caster} = event;
        let div = document.createElement('div') as HTMLElement;
        div.classList.add('glob-orb');
        div.classList.add(caster.properties.team === 'player' ? 'battle-glob-right' : 'battle-glob-left');

        div.innerHTML = (`
            <svg viewBox='0 0 32 32' width='32' height='32'>
                <circle cx='16' cy='16' r='16' fill="${event.color}" />
            </svg>
        `
        )

        div.addEventListener('animationend', () => {
            div.remove()
        })

        document.querySelector('.Battle')?.appendChild(div)

        await utils.wait(820);
        onCompelete();
    }
}

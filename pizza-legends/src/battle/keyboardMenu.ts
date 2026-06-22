import { Behavior } from "../gameobject";
import { KeyPressListener } from "../keypressListener";

export class KeyboardMenu {
    options: Array<Behavior>;
    up: null | KeyPressListener;
    down: null | KeyPressListener;
    prevFocus: null | HTMLElement;
    element?: HTMLElement;
    descriptionElement?: HTMLElement;
    descriptionElementText?: HTMLElement;
    descriptionContainer: HTMLElement | null;

    constructor(config?: Record<string,any>) {

        this.options = [];
        this.up = null;
        this.down = null;
        this.prevFocus = null;
        this.descriptionContainer = config?.descriptionContainer || null;
    }

    setOptions(options: Array<Behavior>) {
        this.options = options;
        if (!this.element) return;
        this.element.innerHTML = this.options.map((option, index) => {
            const disabledAttr = option.disabled ? 'disabled' : ''
            return (`
                <div class='option'>
                    <button data-button='${index}' data-description='${option.description}' ${disabledAttr}>${option.label}</button>
                    <span class='right'>${option.right ? option.right() : ''}</span>
                </div>
            `)
        }).join('');

        const buttons = this.element.querySelectorAll('button');
        buttons.forEach((_x, i) => {
            const button = buttons[i];
            button.addEventListener('click', () => {
                const chosenOption = this.options[Number(button.dataset.button)];
                chosenOption.handler();
            })

            button.addEventListener('mouseenter', () => {
                button?.focus();
            })

            button.addEventListener('focus', () => {
                this.prevFocus = button as HTMLElement;
                if (this.descriptionElementText)
                    this.descriptionElementText.innerText = button.dataset.description || '';
            })
        })

        setTimeout(() => {
            const el = this.element?.querySelector('button[data-button]:not([disabled])') as HTMLButtonElement;
            el?.focus();
        }, 10)
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('KeyboardMenu')

        this.descriptionElement = document.createElement('div') as HTMLElement;
        this.descriptionElement.classList.add('DescriptionBox');
        this.descriptionElement.innerHTML = (`<p></p>`);
        this.descriptionElementText = this.descriptionElement.querySelector("p") as HTMLElement;
    }

    end() {

        this.element?.remove();
        this.descriptionElement?.remove();

        this.up?.unbind()
        this.down?.unbind()
    }

    init(container: HTMLElement) {
        this.createElement();
        if (!this.element) return;
        if (!this.descriptionElement) return;
        container.appendChild(this.element);
        (this.descriptionContainer || container).appendChild(this.descriptionElement);

        this.up = new KeyPressListener('ArrowUp', () => {
            if (!this.element) return;
            if (!this.prevFocus) return;
            const current = Number(this.prevFocus.getAttribute('data-button'));
            const buttons = Array.from(this.element.querySelectorAll('button[data-button]')).reverse() as Array<HTMLButtonElement>;
            const prevButton = buttons.find(el => {
                return Number(el.dataset.button) < current && !el.disabled;
            })

            prevButton?.focus()

        })

        this.down = new KeyPressListener('ArrowDown', () => {
            if (!this.element) return;
            if (!this.prevFocus) return;
            const current = Number(this.prevFocus.getAttribute('data-button'));
            const buttons = Array.from(this.element.querySelectorAll('button[data-button]')) as Array<HTMLButtonElement>;
            const nextButton = buttons.find(el => {
                return Number(el.dataset.button) > current && !el.disabled;
            });

            nextButton?.focus();
        })

    }
}

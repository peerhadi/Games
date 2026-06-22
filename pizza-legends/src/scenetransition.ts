
export class SceneTransition {
    element: HTMLElement | null;
    constructor() {
        this.element = null;
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('SceneTransition');
    }

    fadeOut() {
        this.element?.classList.add('fade-out')
    }

    init(container: HTMLElement, callback: Function) {
        this.createElement();

        if (this.element != null)
            container.appendChild(this.element)

        this.element?.addEventListener('animationend', () => {
            callback();
        }, { once: true })
    }
}

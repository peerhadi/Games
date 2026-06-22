import { KeyPressListener } from "./keypressListener";
import { RevealingText } from "./revealingtext";

export class TextMessage {
    text: string;
    onCompelete: Function;
    element: null | HTMLElement;
    actionListener?: KeyPressListener;
    revealingText?: RevealingText;
    constructor(text: string, onCompelete: Function) {
        this.text = text;
        this.onCompelete = onCompelete;
        this.element = null;
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('TextMessage');

        this.element.innerHTML = (`
            <p class="TextMessage_p"></p>
            <button class="TextMessage_button">Next</button>
        `)

        this.revealingText = new RevealingText({
            text: this.text,
            element: this.element.querySelector('.TextMessage_p')
        });

        this.revealingText.init()

        this.element.querySelector('button')?.addEventListener('click', () => {
            this.done()
        })

        this.actionListener = new KeyPressListener("Enter", () => {
            this.done()
        })
    }

    done() {
        if (!this.revealingText) return;
        if (this.revealingText.isDone) {
            this.element?.remove();
            this.actionListener?.unbind()
            this.onCompelete()
        } else {
            this.revealingText.wrapToDone();
        }
    }

    init(container: HTMLElement) {
        this.createElement();
        if (this.element === null) return;
        container.appendChild(this.element)
    }
}

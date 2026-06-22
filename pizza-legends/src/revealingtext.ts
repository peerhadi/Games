export class RevealingText {
    element: HTMLElement;
    text: string;
    speed: number;
    timeout: null | any;
    isDone: boolean;

    constructor(config: any) {
        this.element = config.element;
        this.text = config.text;
        this.speed = config.speed || 70;

        this.timeout = null;
        this.isDone = false;
    }

    wrapToDone(){
        clearTimeout(this.timeout);
        this.isDone = true;
        this.element.querySelectorAll('span').forEach(s => {
            s.classList.add('revealed')
        })
    }

    init() {
        let characters: Array<{ span: HTMLSpanElement; delayAfter: number; }> = [];
        this.text.split("").forEach(character => {
            let span = document.createElement('span');
            span.textContent = character;
            this.element.appendChild(span);

            characters.push({
                span,
                delayAfter: character === ' ' ? 0 : this.speed
            })

        })
        this.revealOneCharacter(characters)
    }

    revealOneCharacter(list: Array<{ span: HTMLSpanElement; delayAfter: number; }>) {
        const next = list.splice(0, 1)[0];
        next.span.classList.add('revealed');

        if (list.length > 0) {
            this.timeout = setTimeout(() => {
                this.revealOneCharacter(list);
            }, next.delayAfter)
        } else {
            this.isDone = true;
        }
    }
}

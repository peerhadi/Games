import { State } from "./person";

export const utils = {
    withGrid(n: number) {
        return n * 16
    },

    asGridCoord(x: number, y: number) {
        return `${x * 16},${y * 16}`
    },

    nextPosition(initialX: number, initialY: number, direction: State) {
        let x = initialX;
        let y = initialY;
        const size = 16;

        if (direction === 'left') {
            x -= size;
        } else if (direction === 'right') {
            x += size;
        } else if (direction === 'up') {
            y -= size;
        } else if (direction === 'down') {
            y += size;
        }

        return { x, y }
    },

    emitEvent(name: string, detail: Record<string, any>) {
        const event = new CustomEvent(name, {
            detail
        });


        document.dispatchEvent(event);

    },

    oppositeDirection(direction: State) {
        if (direction == 'left') return 'right';
        if (direction == 'right') return 'left';
        if (direction == 'up') return 'down';

        return 'up'
    },

    wait(ms: number){
        return new Promise((resolve: Function) => {
            setTimeout(() => {
                resolve();
            },ms)
        })
    },

    randomFromArray(array: Array<any>){
        return array[Math.floor(Math.random() * array.length)]
    }
}

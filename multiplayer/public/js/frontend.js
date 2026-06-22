const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const socket = io();

const scoreEl = document.querySelector('#scoreEl')

const frontEndProjectiles = {};
const frontEndPlayers = {};
const devicePixelRatio = window.devicePixelRatio || 1;

const playerInputs = [];
canvas.width = 1024 * devicePixelRatio;
canvas.height = 576 * devicePixelRatio;

c.scale(devicePixelRatio, devicePixelRatio)

socket.on('updateProjectiles', (backEndProjectiles) => {
    for (const id in backEndProjectiles) {
        const backEndProjectile = backEndProjectiles[id];
        if (!frontEndProjectiles[id]) {
            frontEndProjectiles[id] = new Projectile(backEndProjectile.x, backEndProjectile.y, 5, frontEndPlayers[backEndProjectile.playerId]?.color, backEndProjectile.velocity)
        } else {
            frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
            frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
        }
    }

    for (const id in frontEndProjectiles) {
        if (!backEndProjectiles[id]) {
            delete frontEndProjectiles[id]
        }
    }
})

socket.on('updatePlayers', (backEndPlayers) => {
    for (const id in backEndPlayers) {
        const backendPlayer = backEndPlayers[id];

        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({
                x: backendPlayer.x,
                y: backendPlayer.y,
                radius: 10,
                color: backendPlayer.color,
                sequenceNumber: 0,
                username: backendPlayer.username,
            })
            document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backendPlayer.score}">${backendPlayer.username}: ${backendPlayer.score}</div>`
        } else {
            document.querySelector(
                `div[data-id="${id}"]`
            ).innerHTML = `${backendPlayer.username}: ${backendPlayer.score}`

            document
                .querySelector(`div[data-id="${id}"]`)
                .setAttribute('data-score', backendPlayer.score)

            // sorts the players divs
            const parentDiv = document.querySelector('#playerLabels')
            const childDivs = Array.from(parentDiv.querySelectorAll('div'))

            childDivs.sort((a, b) => {
                const scoreA = Number(a.getAttribute('data-score'))
                const scoreB = Number(b.getAttribute('data-score'))

                return scoreB - scoreA
            })

            // removes old elements
            childDivs.forEach((div) => {
                parentDiv.removeChild(div)
            })

            // adds sorted elements
            childDivs.forEach((div) => {
                parentDiv.appendChild(div)
            })
            frontEndPlayers[id].target = {
                x: backendPlayer.x,
                y: backendPlayer.y
            }

            if (id === socket.id) {
                const lastBackendInputIndex = playerInputs.findIndex(input => {
                    return backendPlayer.sequenceNumber === input.sequenceNumber
                })

                if (lastBackendInputIndex > -1)
                    playerInputs.splice(0, lastBackendInputIndex + 1)

                playerInputs.forEach(input => {
                    frontEndPlayers[id].target.x += input.dx;
                    frontEndPlayers[id].target.y += input.dy;
                })

            }
        }
    };

    for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
            const divToDelete = document.querySelector(`div[data-id="${id}"]`);
            divToDelete?.parentNode.removeChild(divToDelete)

            if (id === socket.id)
                document.querySelector('#usernameForm').style.display = 'block'

            delete frontEndPlayers[id]
        }
    }
})

const keys = {
    KeyW: {
        pressed: false
    },
    KeyA: {
        pressed: false
    },
    KeyS: {
        pressed: false
    },
    KeyD: {
        pressed: false
    }
}
const SPEED = 5;
let sequenceNumber = 0;


setInterval(() => {
    const x = [
        {
            keycode: 'KeyW',
            dx: 0,
            dy: -SPEED
        },
        {
            keycode: 'KeyA',
            dx: -SPEED,
            dy: 0
        },
        {
            keycode: 'KeyS',
            dx: 0,
            dy: SPEED
        },
        {
            keycode: 'KeyD',
            dx: SPEED,
            dy: 0
        },
    ]
    x.forEach(({ keycode, dx, dy }) => {
        if (keys[keycode].pressed) {
            sequenceNumber++;

            playerInputs.push({ sequenceNumber, dx, dy })
            socket.emit('keydown', { keycode, sequenceNumber })
        }
    })
}, 15)

window.addEventListener('keyup', (e) => {
    handleKey(e.code, false);
})

window.addEventListener('keydown', (e) => {
    handleKey(e.code, true);
})

function handleKey(keyCode, pressed) {
    if (!frontEndPlayers[socket.id]) return;
    if(keys[keyCode])
    keys[keyCode].pressed = pressed;
}

function validKey(keyCode) {
    return ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(keyCode);
}


let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    for (const id in frontEndPlayers) {
        const player = frontEndPlayers[id];
        if (player.target) {
            player.x += (player.target.x - player.x) * 0.5
            player.y += (player.target.y - player.y) * 0.5
        }
        player.draw();
    }

    for (const id in frontEndProjectiles) {
        const projectile = frontEndProjectiles[id];
        projectile.draw();
    }
}
document.querySelector('#usernameForm').addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit('initGame', { username: document.querySelector('#usernameInput').value, width: canvas.width, height: canvas.height, devicePixelRatio });

    document.querySelector('#usernameForm').style.display = 'none';
})
animate()

const e = require('express');
const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 1000 });
const port = 3000
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}
const backEndProjectiles = {}
let projectileId = 0;
io.on('connection', (socket) => {


    io.emit('updatePlayers', backEndPlayers)
    socket.on('initGame', ({ username, width, height }) => {

        backEndPlayers[socket.id] = {
            x: Math.random() * 1024,
            y: Math.random() * 576,
            color: `hsl(${360 * Math.random()}, 100%, 50%)`,
            score: 0,
            username,
        }
        backEndPlayers[socket.id].canvas = {
            width,
            height
        }

        backEndPlayers[socket.id].radius = 10;
    }),
    socket.on('disconnect', (_reason) => {
        delete backEndPlayers[socket.id]
        io.emit('updatePlayers', backEndPlayers)
    })

    socket.on('shoot', ({ x, y, angle }) => {
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }
        projectileId++;

        backEndProjectiles[projectileId] = {
            x, y, velocity, playerId: socket.id,
        }
    })
    socket.on('keydown', ({ keycode, sequenceNumber }) => {
        const backEndPlayer = backEndPlayers[socket.id];
        
        if(!backEndPlayers[socket.id]) return;

        backEndPlayers[socket.id].sequenceNumber = sequenceNumber;
        switch (keycode) {
            case 'KeyW':
                backEndPlayers[socket.id].y -= 5
                break;
            case 'KeyA':
                backEndPlayers[socket.id].x -= 5
                break;
            case 'KeyS':
                backEndPlayers[socket.id].y += 5
                break;
            case 'KeyD':
                backEndPlayers[socket.id].x += 5
                break;
        }

        let playerSides = {
            left: backEndPlayer.x - backEndPlayer.radius,
            right: backEndPlayer.x + backEndPlayer.radius,
            top: backEndPlayer.y - backEndPlayer.radius,
            bottom: backEndPlayer.y + backEndPlayer.radius,
        }

        if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius
        if (playerSides.right > 1024) backEndPlayers[socket.id].x = 1024 - backEndPlayer.radius
        if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius
        if (playerSides.bottom > 576) backEndPlayers[socket.id].y = 576 - backEndPlayer.radius

    })


});

server.listen(port, () => {
});
setInterval(() => {

    for (const id in backEndProjectiles) {
        backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
        backEndProjectiles[id].y += backEndProjectiles[id].velocity.y
        const PROJECTILE_RADIUS = 5;
        if (backEndProjectiles[id].x - PROJECTILE_RADIUS >=
            backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
            backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
            backEndProjectiles[id].y - PROJECTILE_RADIUS >=
            backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
            backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0) {
            delete backEndProjectiles[id];
            continue;
        }

        for (let playerId in backEndPlayers) {
            const backEndPlayer = backEndPlayers[playerId];

            const distance = Math.hypot(
                backEndProjectiles[id].x - backEndPlayer.x,
                backEndProjectiles[id].y - backEndPlayer.y
            )
            if (distance < 5 + backEndPlayer.radius &&
                backEndProjectiles[id].playerId !== playerId) {
                if (backEndPlayers[backEndProjectiles[id].playerId])
                    backEndPlayers[backEndProjectiles[id].playerId].score++;
                delete backEndProjectiles[id];
                delete backEndPlayers[playerId];

                break;
            }
        }
    }
    io.emit('updateProjectiles', backEndProjectiles)
    io.emit('updatePlayers', backEndPlayers)
}, 15)

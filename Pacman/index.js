const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let score = 0;

class Boundary {
    static width = 40;
    static height = 40;
    constructor({position, image}) {
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians = 0.75;
        this.openRate = 0.08;
        this.lastKey;
        this.keys = {
            w: {
                pressed: false,
            },
            a: {
                pressed: false,
            },
            s: {
                pressed: false,
            },
            d: {
                pressed: false,
            },
        };
        this.rotation = 0;
    }

    draw() {
        c.save();
        c.translate(this.position.x,this.position.y);
        c.rotate(this.rotation);
        c.translate(-this.position.x,-this.position.y);
        
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians);
        c.lineTo(this.position.x,this.position.y)
        c.fillStyle = "yellow";
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.radians < 0 || this.radians > 0.75)
            this.openRate = -this.openRate;

            this.radians += this.openRate;

    }
}

class Ghost {

    static speed = 2;
    constructor({position, velocity, color = "red"}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.prevCollisions = [];
        this.scared = false;
    }

    draw() {
        c.beginPath();
        c.arc(
            this.position.x - this.velocity.x,
            this.position.y - this.velocity.y,
            this.radius,
            0,
            Math.PI * 2,
        );
        c.fillStyle = this.scared ? "blue" : this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Pellet {
    constructor({position}) {
        this.position = position;
        this.radius = 3;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = "white";
        c.fill();
        c.closePath();
    }

}

class PowerUp {
    constructor({position}) {
        this.position = position;
        this.radius = 8;
    }

    draw() {
        c.beginPath();
        c.fillStyle = "white";
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.closePath();
    }
}

let pellets = [];
const map = [
    ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
    ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
    ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
    ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
    ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
    ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
    ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
    ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
    ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
    ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
    ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
    ["|", ".", ".", ".", ".", ".", ".", ".", ".", "p", "|"],
    ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];

const powerUps = [];

const ghosts = [
    new Ghost({ 
        position: {
            x: Boundary.width * 3 + Boundary.width / Ghost.speed,
            y: Boundary.height * 5 + Boundary.height / Ghost.speed,
        },
        velocity: {
            x: Ghost.speed,
            y: 0,
        },
    }),
    new Ghost({ 
        position: {
            x: Boundary.width * 6 + Boundary.width / Ghost.speed,
            y: Boundary.height + Boundary.height / Ghost.speed,
        },
        velocity: {
            x: Ghost.speed,
            y: 0,
        },
        color: "aqua"
    }),
    new Ghost({
        position: {
            x: Boundary.width * 5 + Boundary.width / Ghost.speed,
            y: Boundary.height * 8 + Boundary.height / Ghost.speed,
        },
        velocity: {
            x: Ghost.speed,
            y: 0,
        },
        color: "lime",
    }),
    new Ghost({
        position: {
            x: Boundary.width * Ghost.speed + Boundary.width / Ghost.speed,
            y: Boundary.height * 5 + Boundary.height / Ghost.speed,
        },
        velocity: {
            x: Ghost.speed,
            y: 0,
        },
        color: "white",
    }),
];
const player = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
        x: 0,
        y: 0,
    },
});
const boundaries = [];

function circleCollidesWithRectangle({circle, rectangle}) {
    return (
        circle.position.y - circle.radius + circle.velocity.y <=
            rectangle.position.y + rectangle.height &&
        circle.position.x + circle.radius + circle.velocity.x >=
            rectangle.position.x &&
        circle.position.y + circle.radius + circle.velocity.y >=
            rectangle.position.y &&
        circle.position.x - circle.radius + circle.velocity.x <=
            rectangle.position.x + rectangle.width
    );
}

function createImage(src) {
    let image = new Image();
    image.src = src;

    return image;
}

map.forEach((row, index) => {
    row.forEach((symbol, jndex) => {
        switch (symbol) {
            case "-":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeHorizontal.png"),
                    }),
                );
                break;
            case "|":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeVertical.png"),
                    }),
                );
                break;
            case "[":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/capLeft.png"),
                    }),
                );
                break;
            case "]":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/capRight.png"),
                    }),
                );
                break;
            case "_":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/capBottom.png"),
                    }),
                );
                break;
            case "^":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/capTop.png"),
                    }),
                );
                break;
            case "+":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeCross.png"),
                    }),
                );
                break;
            case "5":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeConnectorTop.png"),
                    }),
                );
                break;
            case "6":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeConnectorRight.png"),
                    }),
                );
                break;
            case "7":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeConnectorBottom.png"),
                    }),
                );
                break;
            case "8":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeConnectorLeft.png"),
                    }),
                );
                break;
            case "b":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/block.png"),
                    }),
                );
                break;
            case "1":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeCorner1.png"),
                    }),
                );
                break;
            case "2":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeCorner2.png"),
                    }),
                );
                break;
            case "3":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeCorner3.png"),
                    }),
                );
                break;
            case "4":
                boundaries.push(
                    new Boundary({
                        position: {
                            x: jndex * Boundary.width,
                            y: index * Boundary.height,
                        },
                        image: createImage("./images/pipeCorner4.png"),
                    }),
                );
                break;
            case ".":
                pellets.push(
                    new Pellet({
                        position: {
                            x: jndex * Boundary.width + Boundary.width / 2,
                            y: index * Boundary.height + Boundary.height / 2,
                        },
                    }),
                );
                break;
            case "p":
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: jndex * Boundary.width + Boundary.width / 2,
                            y: index * Boundary.height + Boundary.height / 2,
                        },
                    }),
                );
                break;
        }
    });
});

let counsss = 0;
function animate() {
    counsss++;
    const animationId = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (player.keys.w.pressed && player.lastKey === "w") {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {x: 0, y: -4}},
                    rectangle: boundary,
                })
            ) {
                player.velocity.y = 0;
                break;
            } else {
                player.velocity.y = -4;
            }
        }
    } else if (player.keys.s.pressed && player.lastKey === "s") {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {x: 0, y: 4}},
                    rectangle: boundary,
                })
            ) {
                player.velocity.y = 0;
                break;
            } else {
                player.velocity.y = 4;
            }
        }
    } else if (player.keys.a.pressed && player.lastKey === "a") {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {x: -4, y: 0}},
                    rectangle: boundary,
                })
            ) {
                player.velocity.x = 0;
                break;
            } else {
                player.velocity.x = -4;
            }
        }
    } else if (player.keys.d.pressed && player.lastKey === "d") {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {x: 4, y: 0}},
                    rectangle: boundary,
                })
            ) {
                player.velocity.x = 0;
                break;
            } else {
                player.velocity.x = 4;
            }
        }
    }

    for (let i = pellets.length - 1; i > 0; i--) {
        const pellet = pellets[i];
        pellet.draw();

        if (
            Math.hypot(
                pellet.position.x - player.position.x,
                pellet.position.y - player.position.y,
            ) <
            pellet.radius + player.radius
        ) {
            score += 10;
            document.querySelector("#score").innerHTML = score;
            if(pellets.length === 1){
            }
            pellets.splice(i, 1);
        }
    }
    boundaries.forEach((boundary) => {
        boundary.draw();

        if (
            circleCollidesWithRectangle({circle: player, rectangle: boundary})
        ) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });

    player.update();

    for(let i = ghosts.length - 1; 0 <= i;  i--){
        const ghost = ghosts[i];
        if (
            Math.hypot(
                ghost.position.x - player.position.x,
                ghost.position.y - player.position.y,
            ) <
                ghost.radius + player.radius
        ) {

            if(ghost.scared){
                ghosts.splice(i, 1);
            }else{
                cancelAnimationFrame(animationId);
            }
        }
    }
    for(let i = powerUps.length - 1; 0 <= i; i--){
        const powerUp = powerUps[i];
        powerUp.draw();
        
        if (
            Math.hypot(
                powerUp.position.x - player.position.x,
                powerUp.position.y - player.position.y,
            ) <
            powerUp.radius + player.radius
        ) { 
            powerUps.splice(i, 1);

            ghosts.forEach(ghost => {
                ghost.scared = true;

                setTimeout(() => {
                    ghost.scared = false;
                    console.log(ghost.scared);
                    powerUps.push(
                        new PowerUp({
                            position: {
                                x: 9 * Boundary.width + Boundary.width / 2,
                                y: 11 * Boundary.height + Boundary.height / 2,
                            },
                        }),
                    );
                }, 4000);
            })
        }
    }

    if(pellets.length === 1){
        player.keys.d.pressed = true;
        player.lastKey = "d";
        player.position.x = 60
        player.position.y = 60
        if(counsss % 100 === 0){
            cancelAnimationFrame(animationId);
        }
    }
    ghosts.forEach((ghost) => {
        ghost.update();

        const collisions = [];
        boundaries.forEach((boundary) => {

            if (
                !collisions.includes("right") &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 2,
                            y: 0,
                        },
                    },
                    rectangle: boundary,
                })
            ) {
                ghost.velocity.x = 0;
                ghost.position.x -= 3;
                collisions.push("right");
            } else if (
                !collisions.includes("left") &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: -2,
                            y: 0,
                        },
                    },
                    rectangle: boundary,
                })
            ) {
                ghost.velocity.x = 0;
                ghost.position.x += 3;
                collisions.push("left");
            } else if (
                !collisions.includes("up") &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: -2,
                        },
                    },
                    rectangle: boundary,
                })
            ) {
                ghost.velocity.y = 0;
                ghost.position.y += 3;
                collisions.push("up");
            } else if (
                !collisions.includes("down") &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: 2,
                        },
                    },
                    rectangle: boundary,
                })
            ) {
                ghost.velocity.y = 0;
                ghost.position.y -= 3;
                collisions.push("down");
            }
        });
        if (collisions.length > ghost.prevCollisions.length) {
            ghost.prevCollisions = Array.from(new Set(collisions));
        }
        if (
            JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)
        ) {
            if (ghost.velocity.x === 2) ghost.prevCollisions.push("right");
            else if (ghost.velocity.x === -2) ghost.prevCollisions.push("left");
            else if (ghost.velocity.y === -2) ghost.prevCollisions.push("up");
            else if (ghost.velocity.y === 2) ghost.prevCollisions.push("down");
        }else{
            return
        }

        const pathways = ["up", "left", "right", "down"].filter((x) => {
            return !collisions.includes(x);
        });
        let direction = pathways[Math.floor(Math.random() * pathways.length)];

        switch (direction) {
            case "down":
                ghost.velocity.x = 0;
                ghost.velocity.y = 2;
                break;
            case "up":
                ghost.velocity.x = 0;
                ghost.velocity.y = -2;
                break;
            case "right":
                ghost.velocity.y = 0;
                ghost.velocity.x = 2;
                break;
            case "left":
                ghost.velocity.y = 0;
                ghost.velocity.x = -2;
                break;
        }
        ghost.prevCollisions = [];
    });
    
    if(player.velocity.x > 0) player.rotation = 0;
    else if(player.velocity.x < 0) player.rotation = Math.PI;
    else if(player.velocity.y > 0) player.rotation = Math.PI / 2;
    else if(player.velocity.y < 0) player.rotation = Math.PI * 1.5;
}

animate();

addEventListener("keydown", ({key}) => {
    switch (key) {
        case "w":
            player.keys.w.pressed = true;
            player.lastKey = "w";
            break;
        case "a":
            player.keys.a.pressed = true;
            player.lastKey = "a";
            break;
        case "d":
            player.keys.d.pressed = true;
            player.lastKey = "d";
            break;
        case "s":
            player.keys.s.pressed = true;
            player.lastKey = "s";
            break;
        case "ArrowUp":
            player.keys.w.pressed = true;
            player.lastKey = "w";
            break;
        case "ArrowLeft":
            player.keys.a.pressed = true;
            player.lastKey = "a";
            break;
        case "ArrowRight":
            player.keys.d.pressed = true;
            player.lastKey = "d";
            break;
        case "ArrowDown":
            player.keys.s.pressed = true;
            player.lastKey = "s";
            break;
    }
});

addEventListener("keyup", ({key}) => {
    switch (key) {
        case "w":
            player.keys.w.pressed = false;
            break;
        case "a":
            player.keys.a.pressed = false;
            break;
        case "d":
            player.keys.d.pressed = false;
            break;
        case "s":
            player.keys.s.pressed = false;
            break;
        case "ArrowUp":
            player.keys.w.pressed = false;
            break;
        case "ArrowLeft":
            player.keys.a.pressed = false;
            break;
        case "ArrowRight":
            player.keys.d.pressed = false;
            break;
        case "ArrowDown":
            player.keys.s.pressed = false;
            break;
    }
});

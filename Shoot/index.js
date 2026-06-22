const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const startGameBtn = document.getElementById("startGameBtn");
const scoreEl = document.getElementById("scoreEl");
canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor({position, radius, color}) {
        this.position = position;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2,
            false,
        );
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }
}

class Projectile {
    constructor({position, radius, color, velocity}) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2,
            false,
        );
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Enemy {
    constructor({position, radius, color, velocity}) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2,
            false,
        );
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({position, radius, color, velocity}) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = 0.99;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2,
            false,
        );
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();

        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

let player = new Player({
    position: {
        x: canvas.width / 2,
        y: canvas.height / 2,
    },
    radius: 15,
    color: "white",
});

let projectiles = [];
let particles = [];
let enemies = [];
let score = 0;

function init() {
    player = new Player({
        position: {
            x: canvas.width / 2,
            y: canvas.height / 2,
        },
        radius: 15,
        color: "white",
    });

    projectiles = [];
    particles = [];
    enemies = [];
    score = 0;
    scoreEl.innerHTML = 0;
    bigScoreEl.innerHTML = 0;

    c.clearRect(0, 0, canvas.width, canvas.height);
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;

        let position;
        if (Math.random < 0.5) {
            position = {
                x: Math.random() < 0.5 ? 0 - radius : canvas.width + radius,
                y: Math.random() * canvas.height,
            };
        } else {
            position = {
                x: Math.random() * canvas.width,
                y: Math.random() < 0.5 ? 0 - radius : canvas.height + radius,
            };
        }

        const angle = Math.atan2(
            canvas.height / 2 - position.y,
            canvas.width / 2 - position.x,
        );

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };

        enemies.push(new Enemy({position: position, radius, color, velocity}));
    }, 1000);
}

function animate() {
    const animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0,0,0,0.1)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        const distance = Math.hypot(
            player.position.x - enemy.position.x,
            player.position.y - enemy.position.y,
        );

        if (distance - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);

            document.querySelector("#modalEl").style.display = "flex";
            document.querySelector("#bigScoreEl").innerHTML = score;
        }

        projectiles.forEach((projectile, jndex) => {
            const distance = Math.hypot(
                projectile.position.x - enemy.position.x,
                projectile.position.y - enemy.position.y,
            );

            if (distance - enemy.radius - projectile.radius < 1) {
                if (enemy.radius > 10) {
                    score += 10;
                } else {
                    score += 25;
                }

                scoreEl.innerHTML = score;
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle({
                            position: {
                                x: projectile.position.x,
                                y: projectile.position.y,
                            },
                            radius: Math.random() * 2,
                            color: enemy.color,
                            velocity: {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6),
                            },
                        }),
                    );
                }

                gsap.to(enemy, {
                    radius: enemy.radius > 10 ? enemy.radius - 10 : 0,
                });

                setTimeout(() => {
                    projectiles.splice(jndex, 1);
                }, 0);
            }
        });
    });
    enemies.forEach((enemy, jndex) => {
        if (enemy.radius < 3) {
            enemies.splice(jndex, 1);
        }
    });
}

startGameBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();

    document.querySelector("#modalEl").style.display = "none";
});

addEventListener("click", (e) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2,
    );

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    projectiles.push(
        new Projectile({
            position: {
                x: canvas.width / 2,
                y: canvas.height / 2,
            },
            radius: 5,
            color: "white",
            velocity,
        }),
    );
});

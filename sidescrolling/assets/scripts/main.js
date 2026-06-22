class Game {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.baseHeight = 720;
        this.ratio = this.height / this.baseHeight;
        this.background = new Background(this);
        this.player = new Player(this);
        this.gravity;
        this.speed;
        this.smallFont;
        this.largeFont;
        this.minSpeed;
        this.maxSpeed;
        this.obstacles = [];
        this.numberOfObstacles = 10;
        this.sound = new AudioControl();
        this.timer;
        this.message1;
        this.message2;
        this.eventTimer = 0;
        this.eventInterval = 150;
        this.eventUpdate = false;
        this.touchStartX;
        this.resize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', (e) => {
            this.resize(
                e.currentTarget.innerWidth,
                e.currentTarget.innerHeight
            );
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.player.flap();
        });
        this.canvas.addEventListener('mouseup', (e) => {
            this.player.wingsUp();
        });
        window.addEventListener('keyup', (e) => {
            this.player.wingsUp();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') this.player.flap();
            if (e.key === 'Shift' || e.key.toLowerCase() === 'c')
                this.player.startCharge();

            if (e.key.toLowerCase() === 'f') {
                this.canvas.width = width;
                this.canvas.height = height;
            }
        });

        this.canvas.addEventListener('touchstart', (e) => {
            this.player.flap();
            this.touchStartX = e.changedTouches[0].pageX;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.changedTouches[0].pageX - this.touchStartX > 50) {
                this.player.startCharge();
            }
        });
        this.score = 0;
        this.gameOver;
    }
    checkCollision(a, b) {
        const dx = a.collisionX - b.collisionX;
        const dy = a.collisionY - b.collisionY;

        const distance = Math.hypot(dx, dy);
        const sumOfRadii = a.collisionRadius + b.collisionRadius;
        return distance <= sumOfRadii;
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '15px Bungee';
        this.ctx.textAlign = 'right';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'blue';
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ratio = this.height / this.baseHeight;
        this.gravity = 0.15 * this.ratio;
        this.speed = 3 * this.ratio;
        this.minSpeed = this.speed;
        this.maxSpeed = this.speed * 5;
        this.background.resize();
        this.player.resize();
        this.createObstacles();
        console.log(this.obstacles);
        this.obstacles.forEach((obstacle) => {
            obstacle.resize();
        });
        this.smallFont = Math.ceil(20 * this.ratio);
        this.largeFont = Math.ceil(45 * this.ratio);
        this.timer = 0;
        this.score = 0;
        this.gameOver = false;
    }

    handlePeriodicEvents(deltaTime) {
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime;
            this.eventUpdate = false;
        } else {
            this.eventTimer = this.eventTimer % this.eventInterval;
            this.eventUpdate = true;
        }
    }

    render(deltaTime) {
        //this.ctx.fillStyle = 'red';
        if (!this.timer) {
            this.timer = 0;
        }
        this.handlePeriodicEvents(deltaTime);
        if (!this.gameOver) {
            this.timer += deltaTime;
        }
        this.background.update();
        this.background.draw();
        this.player.update();
        this.player.draw();
        this.obstacles.forEach((obstacle) => {
            obstacle.update();
            obstacle.draw();
        });
        this.drawStatusText();
    }
    createObstacles() {
        this.obstacles = [];
        const firstX = this.baseHeight * this.ratio;

        const obstacleSpacing = 600 * this.ratio;
        for (let i = 0; i < this.numberOfObstacles; i++) {
            this.obstacles.push(
                new Obstacle(this, firstX + i * obstacleSpacing)
            );
        }
    }
    formatTimer() {
        return (this.timer * 0.001).toFixed(1);
    }
    drawStatusText() {
        this.ctx.save();
        this.ctx.fillText('Score : ' + this.score, this.width - 10, 30);
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Timer : ' + this.formatTimer(), 10, 30);
        if (this.gameOver) {
            if (this.player.collided) {
                this.message1 = 'Getting Rusty';
                this.message2 =
                    'Collision Time ' + this.formatTimer() + 'seconds!';
            } else {
                this.message1 = 'Nailed It';
                this.message2 =
                    'Can you do it faster than ' +
                    this.formatTimer() +
                    'seconds?';
            }
            this.ctx.textAlign = 'center';
            this.ctx.font = `${this.largeFont}px Bungee`;
            this.ctx.fillText(
                this.message1,
                this.width * 0.5,
                this.height * 0.5 - this.largeFont
            );
            this.ctx.font = `${this.smallFont}px Bungee`;
            this.ctx.fillText(
                this.message2,
                this.width * 0.5,
                this.height * 0.5 - this.smallFont
            );
            this.ctx.fillText(
                "Press 'R' to try again!",
                this.width * 0.5,
                this.height * 0.5
            )
        }

        this.ctx.restore();
    }
}

window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const game = new Game(canvas, ctx);
    let lastTime = 0;
    let l = 0;
    function animate(timeStamp) {
        if (game.gameOver && l === 1) {
            lastTime = 0;
            l = 0;
            game.gameOver = false;
        }
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(deltaTime);

        requestAnimationFrame(animate);
    }
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') {
            game.resize(window.innerWidth, window.innerHeight);
        }
    });
    animate();
});

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const PLAYER_WIDTH = 120;
const PLAYER_HEIGHT = 20;

class Player {
  constructor({ x, y }) {
    this.x = x;
    this.y = y;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
  }

  draw(ctx) {
    ctx.fillStyle = 'lime'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

const player = new Player({ x: (window.innerWidth - PLAYER_WIDTH) / 2, y: window.innerHeight - (PLAYER_HEIGHT * 5) });
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  player.draw(ctx);
  requestAnimationFrame(animate)
}
animate()

document.addEventListener('mousemove', (e) => {
  player.x = e.clientX - (PLAYER_WIDTH / 2)
})

import getMousePos from '../utils/getMousePos';
import { Block, BlockStrength } from './block';
import { Air, Dirt } from './blocksTypes';
import Camera from './camera';
import Coords from './coords';
import Inventory from './inventory';
import InventorySlot from './inventorySlot';
import Player from './player';
import World from './world';
let keyPressedTimes = 0;

class Game {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	world: World;
	camera: Camera;
	player: Player;
	inventory: Inventory;
	targetBlockPosition: Coords;
	mousePosition: Coords;
	tileSetForeground: HTMLImageElement;

	constructor(canvasName: string) {
		this.canvas = document.getElementById(canvasName) as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d');
		this.world = new World();
		this.camera = new Camera(new Coords(0, 0));
		this.player = new Player();
		this.player.position = new Coords((World.WORLD_WIDTH * World.BLOCK_SIZE) / 2, 0);
		this.inventory = new Inventory();
		this.targetBlockPosition = new Coords(0, 0);
		this.mousePosition = new Coords(0, 0);
	}

	handleMouseMove(e: MouseEvent) {
		this.mousePosition = getMousePos(this.canvas, e, new Coords(0, 0));
	}

	handleMouseClick(e: MouseEvent) {
		try {
			const slots = this.inventory.slots;
			let blockPos = this.getBlockPos(e);

			if (this.world.world[blockPos.x][blockPos.y].id !== -1) {
				if (this.world.world[blockPos.x][blockPos.y].strength !== BlockStrength.INDESTRUCTABLE) {
					const getBlock = slots.find(
						(slot) => slot.quantity < 64 && slot.block.name === this.world.world[blockPos.x][blockPos.y].name
					);
					if (getBlock) {
						slots.find(
							(slot) => slot.quantity < 64 && slot.block.name === this.world.world[blockPos.x][blockPos.y].name
						).quantity += 1;
					} else {
						if (slots.find((x) => x.quantity === 0)) {
							let s = false;
							this.inventory.slots = slots.map((x) => {
								if (!s) {
									s = true;
									if (x.quantity === 0) {
										return new InventorySlot(this.world.world[blockPos.x][blockPos.y], 1);
									} else {
										return x;
									}
								} else {
									return x;
								}
							});
						} else {
							slots.push(new InventorySlot(this.world.world[blockPos.x][blockPos.y], 64));
						}
					}
					this.world.world[blockPos.x][blockPos.y] = Air;
				} else {
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
	blockIntersectsWithObject(
		blockPos: Coords,
		blockSize: number,
		object: any,
		objectWidth: number,
		objectHeight: number
	) {
		return (
			((blockPos.x * World.BLOCK_SIZE >= object.position.x &&
				blockPos.x * World.BLOCK_SIZE <= object.position.x + objectWidth) ||
				(blockPos.x * World.BLOCK_SIZE + blockSize > object.position.x &&
					blockPos.x * World.BLOCK_SIZE + blockSize <= object.position.x + objectWidth) ||
				(blockPos.x * World.BLOCK_SIZE + blockSize / 2 >= object.position.x &&
					blockPos.x * World.BLOCK_SIZE + blockSize / 2 <= object.position.x + objectWidth)) &&
			((blockPos.y * World.BLOCK_SIZE > object.position.y &&
				blockPos.y * World.BLOCK_SIZE < object.position.y + objectHeight) ||
				(blockPos.y * World.BLOCK_SIZE + blockSize > object.position.y &&
					blockPos.y * World.BLOCK_SIZE + blockSize < object.position.y + objectHeight) ||
				(blockPos.y * World.BLOCK_SIZE + blockSize / 2 > object.position.y &&
					blockPos.y * World.BLOCK_SIZE + blockSize / 2 < object.position.y + objectHeight))
		);
	}

	getBlockPos(e: MouseEvent) {
		let pos = getMousePos(this.canvas, e, this.camera.offset);
		let blockPos = new Coords(
			(pos.x - (pos.x % World.BLOCK_SIZE)) / World.BLOCK_SIZE,
			(pos.y - (pos.y % World.BLOCK_SIZE)) / World.BLOCK_SIZE
		);

		return blockPos;
	}
	handleContextMenuClick(e: MouseEvent) {
		try {
			e.preventDefault();
			let blockPos = this.getBlockPos(e);

			const activeSlot = this.inventory.getActiveSlot();
			if (
				this.blockIntersectsWithObject(
					blockPos,
					World.BLOCK_SIZE,
					this.player,
					Player.PLAYER_WIDTH,
					Player.PLAYER_HEIGHT
				)
			) {
				return;
			}
			if (!activeSlot) return;
			if (this.world.world[blockPos.x][blockPos.y].id === -1 && activeSlot.block.id !== -1) {
				if (activeSlot.quantity > 0) {
					this.world.world[blockPos.x][blockPos.y] = activeSlot.block;
					if (activeSlot.block.name === 'Grass') {
						if (
							blockPos.y < World.WORLD_HEIGHT &&
							activeSlot.block.name.toLowerCase().indexOf('background') === -1 &&
							this.world.world[blockPos.x][blockPos.y + 1].name === 'Grass'
						) {
							this.world.world[blockPos.x][blockPos.y + 1] = Dirt;
						} else if (
							blockPos.y < World.WORLD_HEIGHT &&
							activeSlot.block.name.toLowerCase().indexOf('background') === -1 &&
							this.world.world[blockPos.x][blockPos.y - 1].name === 'Grass'
						) {
							this.world.world[blockPos.x][blockPos.y] = Dirt;
						}
					}
					activeSlot.quantity -= 1;

					if (activeSlot.quantity == 0) {
						if (this.inventory.activeSlotNum === 8) {
							this.inventory.activeSlotNum = 0;
						} else {
							this.inventory.activeSlotNum += 1;
						}
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	}

	handleKeyDown(e: KeyboardEvent) {
		if (parseInt(e.key) >= 1 && parseInt(e.key) <= this.inventory.slots.length) {
			this.inventory.setActiveSlotNum(parseInt(e.key));
		} else {
			switch (e.code) {
				case 'KeyA':
					this.player.moveDirection.left = true;
					break;
				case 'KeyD':
					this.player.moveDirection.right = true;
					break;
				case 'KeyW':
					this.player.jumpPressed = true;
					break;
				case 'KeyS':
					this.player.moveDirection.down = true;
					break;
				case 'KeyQ':
					const activeSlotNum = this.inventory.activeSlotNum;
					const activeSlot = this.inventory.slots[activeSlotNum];
					if (activeSlot.quantity) {
						activeSlot.quantity -= 1;
						activeSlot.dropCoords.push(
							new Coords(this.player.position.x / 64 + 0.14, this.player.position.y / 64 + 1.12)
						);
						activeSlot.canTakes.push(false);
						if (this.player.isFalling) {
							if (!this.player.isClimbing) {
								activeSlot.falling = true;
							}
						}
						activeSlot.dropNumber += 1;
					}

					break;

				case 'Space':
					this.player.moveDirection.up = true;
					break;
				case 'Enter':
					break;

				case 'KeyE':
					const commands = document.getElementById('commands') as HTMLInputElement;
					if (commands.style.display != 'block') {
						if (!this.inventory.show) {
							this.inventory.show = true;
						}
					}
					break;
				case 'Escape':
					if (this.inventory.show) {
						this.inventory.show = false;
					}
					if (document.getElementById('commands').style.display === 'block')
						document.getElementById('commands').style.display = 'none';
			}
		}
	}

	handleKeyUp(e: KeyboardEvent) {
		switch (e.code) {
			case 'KeyA':
				this.player.moveDirection.left = false;
				break;
			case 'KeyD':
				this.player.moveDirection.right = false;
				break;
			case 'KeyW':
				this.player.jumpPressed = false;
				this.player.canJump = true;
				break;
			case 'KeyS':
				this.player.moveDirection.down = false;
				break;
			case 'Space':
				this.player.moveDirection.up = false;
				break;
		}
	}

	checkPlayerClimbing() {
		let playerPos = new Coords(
			this.player.position.x + Player.PLAYER_WIDTH / 2,
			this.player.position.y + Player.PLAYER_HEIGHT / 2
		);

		let playerBlockPos = new Coords(
			(playerPos.x - (playerPos.x % 64)) / World.BLOCK_SIZE,
			(playerPos.y - (playerPos.y % 64)) / World.BLOCK_SIZE
		);

		this.player.isClimbing = this.world.world[playerBlockPos.x][playerBlockPos.y].climbing;
	}
	checkPlayerNotFallOutOfWorld() {
		const worldLimitX = World.WORLD_WIDTH * World.BLOCK_SIZE - Player.PLAYER_WIDTH - 65;
		const worldLimitY = World.WORLD_HEIGHT * World.BLOCK_SIZE - Player.PLAYER_HEIGHT - World.BLOCK_SIZE * 3;
		if (this.player.position.x <= 0) {
			this.player.position.x = 0;
		} else if (this.player.position.x >= worldLimitX) {
			this.player.position.x = worldLimitX;
		}

		if (this.player.position.y <= 0) {
			this.player.position.y = 0;
		} else if (this.player.position.y >= worldLimitY) {
			this.player.position.y = worldLimitY;
		}
	}

	gameLoop() {
		if (this.inventory.show === true) {
		}
		if (keyPressedTimes === 0) {
			window.addEventListener(
				'keydown',
				(e: KeyboardEvent) => {
					switch (e.key) {
						case 'ArrowLeft':
							if (!(this.inventory.activeSlotNum - 1 < 0) && this.inventory.slots[this.inventory.activeSlotNum - 1]) {
								this.inventory.setActiveSlotNum(this.inventory.activeSlotNum);
							}
							break;
						case 'ArrowRight':
							if (!(this.inventory.activeSlotNum + 1 > 36) && this.inventory.slots[this.inventory.activeSlotNum + 1]) {
								this.inventory.setActiveSlotNum(this.inventory.activeSlotNum + 2);
							}
							break;
					}
				},
				true
			);
			keyPressedTimes = 1;
		}

		this.checkPlayerNotFallOutOfWorld();

		this.camera.offset = new Coords(
			this.player.position.x - this.canvas.width / 2 + Player.PLAYER_WIDTH,
			this.player.position.y - this.canvas.height / 2 + Player.PLAYER_HEIGHT
		);

		this.ctx.fillStyle = '#87ceeb';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.world.renderBlocks(this.camera, this.canvas, this.ctx);
		this.player.drawPlayer(this.ctx, this.camera);

		this.targetBlockPosition = new Coords(
			(this.camera.offset.x +
				this.mousePosition.x -
				((this.camera.offset.x + this.mousePosition.x) % World.BLOCK_SIZE)) /
				World.BLOCK_SIZE,
			(this.camera.offset.y +
				this.mousePosition.y -
				((this.camera.offset.y + this.mousePosition.y) % World.BLOCK_SIZE)) /
				World.BLOCK_SIZE
		);
		this.world.drawTargetBlock(this.ctx, this.targetBlockPosition, this.camera);
		this.drawInventory();
		this.tileSetForeground = new Image();
		this.tileSetForeground.src = 'img/texturesForeground.png';

		!this.inventory.show ? this.player.move(this.world) : null;
		window.requestAnimationFrame(() => this.gameLoop());
	}

	drawInventory() {
		this.inventory.draw(this.ctx, this.canvas, this.tileSetForeground);

		this.inventory.slots.forEach((slot: InventorySlot) => {
			for (let i = 0; i < slot.dropNumber; i++) {
				if (!this.player.isFalling || this.player.isClimbing) {
					slot.falling = false;
				}

				this.world.drawBlock(this.tileSetForeground, this.ctx, slot.dropCoords[i], slot.block, this.camera, 32);

				if (
					this.blockIntersectsWithObject(slot.dropCoords[i], 32, this.player, Player.PLAYER_WIDTH, Player.PLAYER_HEIGHT)
				) {
					if (slot.canTakes[i] === true) {
						slot.quantity += 1;
						slot.dropNumber -= 1;
						delete slot.dropCoords[i];
						slot.dropCoords = slot.dropCoords.filter((x) => x != undefined);
						slot.canTakes[i] = false;
					}
				} else {
					slot.canTakes[i] = true;
				}
			}
		});
	}

	init() {
		this.inventory.slots = this.inventory.slots.filter((x) => x.quantity != 0);
		this.canvas.addEventListener('mousemove', (e: MouseEvent) => this.handleMouseMove(e));
		this.canvas.addEventListener('click', (e: MouseEvent) => this.handleMouseClick(e));
		this.canvas.addEventListener('contextmenu', (e: MouseEvent) => this.handleContextMenuClick(e));
		document.getElementsByTagName('body')[0].addEventListener('keydown', (e: KeyboardEvent) => this.handleKeyDown(e));
		document.getElementsByTagName('body')[0].addEventListener('keyup', (e: KeyboardEvent) => this.handleKeyUp(e));

		this.canvas.setAttribute('style', 'cursor: url("img/crosshair.png") 8 8, default;');

		this.canvas.width = window.innerWidth - 5;
		this.canvas.height = window.innerHeight;

		this.world.generateWorld();

		window.requestAnimationFrame(() => this.gameLoop());
		window.addEventListener('keydown', (e) => {
			if (e.key === '/') {
				let blocksList: any[] = [];
				let blocksList1 = Object.values(require('./blocksTypes')).filter((x: Block) => x.id != 184);
				if (typeof blocksList1 === 'object') {
					blocksList = [...blocksList1];
				}
				let blockListText = blocksList.map((b: Block) => b.name).map((x) => x.toLowerCase().trim().replace(/ /g, ''));
				const commands = document.getElementById('commands') as HTMLInputElement;
				commands.style.display = 'block';
				commands.value = '';

				commands.focus();

				commands.addEventListener('keydown', (e) => {
					if (e.key === 'Enter' && commands.style.display != 'none') {
						commands.style.display = 'none';
						const text = commands.value.split(' ').map((x) => x.toLowerCase());
						if (text.length < 3) return;
						if (blockListText.includes(text[1]) && parseInt(text[2]) && parseInt(text[2]) <= 64) {
							const index = blockListText.indexOf(text[1]);

							const freeSlot = this.inventory.slots.find((s) => s.quantity === 0);
							if (freeSlot) {
								freeSlot.quantity = parseInt(text[2]);
								freeSlot.block = blocksList[index];
							} else {
								this.inventory.slots.push(new InventorySlot(blocksList[index], parseInt(text[2])));
							}
						}
					}
				});

				this.inventory.activeSlotNum = this.inventory.slots.length - 1;
			}
		});
	}
}

export default Game;

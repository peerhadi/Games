import InventorySlot from './inventorySlot';
import Player from './player';
import World from './world';
let bum = 0;
let pressUpKey = false;
class Inventory {
	activeSlotNum: number;
	slots: Array<InventorySlot>;
	image: HTMLImageElement;
	image2: HTMLImageElement;
	show: boolean;
	skin: HTMLImageElement;
	constructor() {
		this.activeSlotNum = 0;
		this.slots = [];
		this.image = new Image();
		this.image.src = 'img/widgets.png';
		this.image2 = new Image();
		this.image2.src = 'img/inventory1.png';
		this.show = false;
	}

	getActiveSlot(): InventorySlot {
		return this.slots[this.activeSlotNum];
	}

	setActiveSlotNum(num: number) {
		this.activeSlotNum = num - 1;
	}

	draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tileset: HTMLImageElement) {
		if (this.show === true) {
			ctx.filter = 'blur(0px)';
			ctx.fillStyle = 'black';
			ctx.drawImage(this.image2, 0, 0, 1200, 1200, canvas.width / 2 - 340, 100, 700, 700);
			this.slots.forEach((slot, i) => {
				const handleBum = (e: KeyboardEvent) => {
					if (this.activeSlotNum < 9 && this.show) {
						switch (e.key) {
							case 'ArrowUp':
								if (this.slots[this.slots.length - (this.slots.length % 9) + this.activeSlotNum]) {
									pressUpKey = true;
									this.setActiveSlotNum(this.slots.length - (this.slots.length % 9) + this.activeSlotNum + 1);
								}
								break;
						}
					}
				};
				if (bum === 0) {
					window.addEventListener('keydown', handleBum, true);
					bum = 1;
				}
				if (slot.quantity > 0) {
					if (i < 9) {
						let block = slot.block;
						let tileOffsetX = (block.id % World.TILE_SIZE) * World.TILE_SIZE * 2;
						let tileOffsetY = (block.id - (block.id % World.TILE_SIZE)) * 2;
						ctx.drawImage(
							tileset,
							tileOffsetX + block.additionalValue,
							tileOffsetY,
							World.TILE_SIZE * 2,
							World.TILE_SIZE * 2,
							canvas.width / 2 - 260 + 63 * i,
							canvas.height - 190,
							38,
							38
						);
						if (i === this.activeSlotNum) {
							pressUpKey = false;
							ctx.drawImage(this.image, 0, 22, 25, 23, canvas.width / 2 - 269 + 63 * i, canvas.height - 198, 58, 53);
						}

						ctx.font = '14px Minecraft, Arial';
						ctx.fillStyle = 'white';

						if (slot.quantity > 1) {
							ctx.fillText(
								`${slot.quantity}`,
								canvas.width / 2 - (225 + `${slot.quantity}`.length * 3) + 62 * i,
								canvas.height - 150 
							);
						}
					} else {
						if (i < 36) {
							const handleBum = (e: KeyboardEvent) => {
								if (!pressUpKey && this.show) {
									switch (e.key) {
										case 'ArrowUp':
											if (this.slots[this.activeSlotNum - 9]) {
												this.setActiveSlotNum(this.activeSlotNum - 8);
												console.log(this.activeSlotNum - 9);
											}
											break;
										case 'ArrowDown':
											if (this.slots[this.activeSlotNum + 9]) this.setActiveSlotNum(this.activeSlotNum + 10);
											break;
										case 'T':
											const temp = this.slots[this.activeSlotNum];
											this.slots[this.activeSlotNum] = this.slots[0];
											this.slots[0] = temp;
											this.activeSlotNum = 0;
									}
								}
							};
							if (bum === 1) {
								window.addEventListener('keydown', handleBum, true);
								bum = 2;
							}

							let block = slot.block;
							let tileOffsetX = (block.id % World.TILE_SIZE) * World.TILE_SIZE * 2;
							let tileOffsetY = (block.id - (block.id % World.TILE_SIZE)) * 2;
							ctx.drawImage(
								tileset,
								tileOffsetX + block.additionalValue,
								tileOffsetY,
								World.TILE_SIZE * 2,
								World.TILE_SIZE * 2,
								canvas.width / 2 -
									262 +
								  63 * (i - (i >= 9 && i < 18 ? 9 : i >= 18 && i < 27 ? 18 : i >= 27 && i < 36 ? 27 : 0)),
								canvas.height - 392 + 63 * (Math.floor(i / 9) - 1),
								38,
								38
							);
							if (i === this.activeSlotNum) {
								pressUpKey = false;
								ctx.drawImage(
									this.image,
									0,
									22,
									25,
									23,
									canvas.width / 2 -
										269 +
										63 * (i - (i >= 9 && i < 18 ? 9 : i >= 18 && i < 27 ? 18 : i >= 27 && i < 36 ? 27 : 0)),
									canvas.height - 400 + 63 * (Math.floor(i / 9) - 1),
									58,
									53
								);
							}
							ctx.font = '14px Minecraft, Arial';
							ctx.fillStyle = 'white';

							if (slot.quantity > 1) {
								ctx.fillText(
									`${slot.quantity}`,
									canvas.width / 2 -
										(225 + `${slot.quantity}`.length * 3) +
										63 * (i - (i >= 9 && i < 18 ? 9 : i >= 18 && i < 27 ? 18 : i >= 27 && i < 36 ? 27 : 0)),
									canvas.height - 348 + 63 * (Math.floor(i / 9) - 1)
								);
							}
						}
					}
				}
			});

			this.skin = new Image();
			this.skin.src = 'img/skin.png';
			ctx.drawImage(
				this.skin,
				0,
				0,
				130,
				260,
				canvas.width / 2 - 160,
				canvas.height - 640,
				Player.PLAYER_WIDTH * 1.5,
				Player.PLAYER_HEIGHT * 1.5
			);
		} else {
			window.removeEventListener('keydown', () => {});
			ctx.drawImage(this.image, 0, 0, 190, 22, canvas.width / 2 - 290, canvas.height - 55, 475, 55);

			this.slots.forEach((slot, i) => {
				if (i < 9) {
					if (slot.quantity > 0) {
						let block = slot.block;
						let tileOffsetX = (block.id % World.TILE_SIZE) * World.TILE_SIZE * 2;
						let tileOffsetY = (block.id - (block.id % World.TILE_SIZE)) * 2;
						ctx.drawImage(
							tileset,
							tileOffsetX + block.additionalValue,
							tileOffsetY,
							World.TILE_SIZE * 2,
							World.TILE_SIZE * 2,
							canvas.width / 2 - 279 + 50 * i,
							canvas.height - 44,
							32.78,
							32.78
						);

						ctx.font = '14px Minecraft, Arial';
						ctx.fillStyle = 'white';

						if (slot.quantity > 1) {
							ctx.fillText(
								`${slot.quantity}`,
								canvas.width / 2 - (252 + `${slot.quantity}`.length * 3) + 50 * i,
								canvas.height - 10
							);
						}
					}
					if (i === this.activeSlotNum) {
						ctx.drawImage(this.image, 0, 22, 25, 23, canvas.width / 2 - 289.5 + 50 * i, canvas.height - 54.5, 57, 52);
					}
				}
			});
		}
	}
}
export default Inventory;

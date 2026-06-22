import * as sharp from 'sharp';
import randomInteger from '../utils/randomMinMax';
import { Block } from './block';
import {
	Air,
	Bedrock,
	Birch,
	CoalOre,
	DiamondOre,
	Dirt,
	GoldOre,
	Grass,
	IronOre,
	Leaves,
	Mushroom,
	OakLog,
	RedRose,
	RubyOre,
	Stone,
	TargetBlock,
	WoodenLog,
	YellowRose
} from './blocksTypes';
import Camera from './camera';
import Coords from './coords';

class World {
	static BLOCK_SIZE = 64;
	static TILE_SIZE = 16;
	static WORLD_WIDTH = 120;
	static WORLD_HEIGHT = 62;

	world: Array<Array<Block>>;
	tileSetForeground: HTMLImageElement;
	tileSetBackground: HTMLImageElement;

	constructor() {
		this.world = new Array();
		this.tileSetForeground = new Image();
		this.tileSetForeground.src = 'img/texturesForeground.png';
		this.tileSetBackground = new Image();
		this.tileSetBackground.src = 'img/texturesBackground.png';
	}

	static getBlockPositionByCoords(coords: Coords): Coords {
		return new Coords(
			(coords.x - (coords.x % World.BLOCK_SIZE)) / World.BLOCK_SIZE,
			(coords.y - (coords.y % World.BLOCK_SIZE)) / World.BLOCK_SIZE
		);
	}

	drawBlock(
		tileset: HTMLImageElement,
		ctx: CanvasRenderingContext2D,
		coords: Coords,
		block: Block,
		camera: Camera,
		blockSize?: number
	) {
		let tileOffsetX = (block.id % World.TILE_SIZE) * World.TILE_SIZE * 2;
		let tileOffsetY = (block.id - (block.id % World.TILE_SIZE)) * 2;

		let pos = new Coords(coords.x * World.BLOCK_SIZE, coords.y * World.BLOCK_SIZE);
		ctx.drawImage(
			tileset,
			tileOffsetX + block.additionalValue + (block.id === 13 ? -1 : 0),
			tileOffsetY + (block.additionalValue2 ? block.additionalValue2 : 0) - block.additionalValue3,
			World.TILE_SIZE * 2,
			World.TILE_SIZE * 2,
			pos.x - camera.offset.x,
			pos.y - camera.offset.y,
			(blockSize ? blockSize : World.BLOCK_SIZE) - block.additionalValue2 / 2,
			(blockSize ? blockSize : World.BLOCK_SIZE) - block.additionalValue2 / 2
		);
	}

	drawTargetBlock(ctx: CanvasRenderingContext2D, coords: Coords, camera: Camera) {
		this.drawBlock(this.tileSetForeground, ctx, coords, TargetBlock, camera);
	}

	renderBlocks(camera: Camera, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		let screenHorizontalStart = camera.offset.x,
			screenHorizontalEnd = camera.offset.x + canvas.width;
		let horizontalBlockStart = (screenHorizontalStart - (screenHorizontalStart % 64)) / 64,
			horizontalBlockEnd = (screenHorizontalEnd - (screenHorizontalEnd % 64)) / 64;
		let screenVerticalStart = camera.offset.y,
			screenVerticalEnd = camera.offset.y + canvas.height;
		let verticalBlockStart = (screenVerticalStart - (screenVerticalStart % 64)) / 64,
			verticalBlockEnd = (screenVerticalEnd - (screenVerticalEnd % 64)) / 64;

		for (let x = 0; x < this.world.length; x++) {
			for (let y = 0; y < this.world[x].length; y++) {
				if (
					x >= horizontalBlockStart &&
					x <= horizontalBlockEnd &&
					y >= verticalBlockStart &&
					y <= verticalBlockEnd + 1
				) {
					if (!this.world[x][y]) {
						continue;
					}

					this.drawBlock(
						this.world[x][y].solid ? this.tileSetForeground : this.tileSetBackground,
						ctx,
						new Coords(x, y),
						this.world[x][y],
						camera,
						0
					);
				}
			}
		}
	}

	generateWorld() {
		let prevHeight = 0;
		for (let x = 0; x < World.WORLD_WIDTH; x++) {
			let row: Array<Block> = [];
			let randHeight = randomInteger(0, 1);
			let height = randHeight === 1 ? prevHeight + 1 : prevHeight - 1;

			if (height >= 3) {
				height = 2;
			}

			prevHeight = height;

			for (let y = 0; y < World.WORLD_HEIGHT; y++) {
				if (y >= World.WORLD_HEIGHT - 4) {
					row.push(Bedrock);
				} else if (y > 13 - height) {
					if (Math.random() < 0.04) {
						if (y > 15 - height || Math.random() < 0.03) {
							row.push(CoalOre);
						}
					} else if (Math.random() < 0.02) {
						if (y > 15 - height || Math.random() < 0.01) {
							row.push(IronOre);
						}
					} else if (Math.random() < 0.008) {
						if (y > 17 - height || Math.random() < 0.007) {
							row.push(GoldOre);
						}
					} else if (Math.random() < 0.005) {
						if (y > 22 - height || Math.random() < 0.004) {
							row.push(DiamondOre);
						}
					} else if (Math.random() < 0.006) {
						if (y > 18 - height || Math.random() < 0.005) {
							row.push(RubyOre);
						}
					} else {
						row.push(Stone);
					}
				} else if (y > 10 - height) {
					row.push(Dirt);
				} else if (y > 9 - height) {
					row.push(Grass);
				} else if (y > 8 - height && Math.random() < 0.3) {
					let hadi = Math.random();
					if (hadi < 0.1) {
						row.push(YellowRose);
					} else if (hadi > 0.1 && hadi < 0.2) {
						row.push(RedRose);
					} else if (hadi > 0.3 && hadi < 0.4) {
						row.push(Mushroom);
					} else {
						if (this.isAvalible(x)) {
							const bum = Math.random();
							if (bum < 0.33) row.push(WoodenLog);
							else if (bum > 0.33 && bum < 0.66) row.push(Birch);
							else row.push(OakLog);
						}
					}
				} else {
					row.push(Air);
				}
			}

			this.world.push(row);
		}

		for (let i = 0; i < this.world.length; i++) {
			for (let j = 0; j < this.world[i].length; j++) {
				const block = this.world[i][j];
				if (block.id === 20) {
					this.world[i][j - 1] = WoodenLog;
				}
				if (block.id === 117) {
					this.world[i][j - 1] = Birch;
				}
				if (block.id === 116) {
					this.world[i][j - 1] = OakLog;
				}
			}
		}
		for (let i = 0; i < this.world.length; i++) {
			for (let j = 0; j < this.world[i].length; j++) {
				const block = this.world[i][j];
				if (
					(block.id === 20 || block.id === 117 || block.id === 116) &&
					(this.world[i][j + 1].id === 20 || this.world[i][j + 1].id === 117 || this.world[i][j + 1].id === 116)
				) {
					this.world[i][j - 1] = Leaves;
				}
			}
		}

		for (let i = 0; i < this.world.length; i++) {
			for (let j = 0; j < this.world[i].length; j++) {
				const block = this.world[i][j];
				if (this.world[i + 1] && block.id === -1 && this.world[i + 1][j].id === 52) {
					this.world[i][j] = Leaves;
					this.world[i][j - 1] = Leaves;
					if (this.world[i + 2]) {
						this.world[i + 2][j] = Leaves;

						this.world[i + 2][j - 1] = Leaves;
					}
					this.world[i + 1][j - 1] = Leaves;
					this.world[i + 1][j - 2] = Leaves;
				}
			}
		}
	}
	isAvalible(x: number) {
		if (this.world[x - 1]) {
			for (const [_i, block] of this.world[x - 1].entries()) {
				if (block.id === 20 || block.id === 116 || block.id === 117 || block.id === 52) {
					return false;
				}
			}
		}

		if (this.world[x - 2]) {
			for (const [_i, block] of this.world[x - 2].entries()) {
				if (block.id === 20 || block.id === 20 || block.id === 116 || block.id === 117 || block.id === 52) {
					return false;
				}
			}
		}

		if (this.world[x - 3]) {
			for (const [_i, block] of this.world[x - 3].entries()) {
				if (block.id === 20 || block.id === 20 || block.id === 116 || block.id === 117 || block.id === 52) {
					return false;
				}
			}
		}
		return true;
	}
}

export default World;

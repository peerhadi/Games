import { Block } from './block';
import Coords from './coords';

class InventorySlot {
	block: Block;
	quantity: number;
	dropCoords: Array<Coords>;
	canTakes: Array<Boolean>;
	dropNumber: number;
	falling: boolean;
	constructor(block: Block, quantity: number) {
		this.block = block;
		this.quantity = quantity;
		this.dropCoords = [];
		this.canTakes = [];
		this.dropNumber = 0;
	}
}

export default InventorySlot;

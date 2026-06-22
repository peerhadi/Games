import Coords from './coords';

export enum BlockStrength {
	WEAK,
	NORMAL,
	STRONG,
	STRONGER,
	INDESTRUCTABLE
}

export class Block {
	id: number;
	solid: boolean;
	climbing: boolean;
	strength: BlockStrength;
	name: string;
	additionalValue: number;
	additionalValue2: number;
	additionalValue3: number;
	additionalValue4: number;
	constructor(
		id: number,
		solid: boolean,
		climbing: boolean,
		strength: BlockStrength,
		name: string,
		additionalValue?: number,
		additionalValue2?: number,
		additionalValue3?: number,
		additionalValue4?: number
	) {
		this.id = id;
		this.solid = solid;
		this.climbing = climbing;
		this.strength = strength;
		this.name = name;

		this.additionalValue = additionalValue ?? 0;
		this.additionalValue2 = additionalValue2 ?? 0;
		this.additionalValue3 = additionalValue3 ?? 0;
		this.additionalValue4 = additionalValue4 ?? 0;
	}
}

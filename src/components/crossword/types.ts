export interface Cell {
	value: string;
	isBlack: boolean;
	wordId?: string;
}

export interface Word {
	id: string;
	text: string;
	row: number;
	col: number;
	direction: Direction;
}

export type Direction = "horizontal" | "vertical";

export interface CrosswordGridProps {
	initialRows?: number;
	initialCols?: number;
}

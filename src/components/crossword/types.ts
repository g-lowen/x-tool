export interface CellCustomization {
	isBlack?: boolean;
	hasRedBorder?: boolean;
	blackBorders?: {
		top?: boolean;
		right?: boolean;
		bottom?: boolean;
		left?: boolean;
	};
}

export interface Cell {
	value: string;
	isBlack: boolean;
	wordId?: string;
	customization?: CellCustomization;
}

export interface BendPoint {
	index: number; // Character index where bend occurs
	direction: Direction; // New direction after this point
}

export interface Word {
	id: string;
	text: string;
	row: number;
	col: number;
	direction: Direction;
	bends?: BendPoint[];
}

export type Direction = "horizontal" | "vertical";

export interface CrosswordGridProps {
	initialRows?: number;
	initialCols?: number;
}

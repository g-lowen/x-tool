import type { Word } from "./types";

export interface LetterPosition {
	row: number;
	col: number;
	char: string;
	index: number;
}

/**
 * Calculate the position of each letter in a word, accounting for bends
 */
export function calculateWordPositions(word: Word): LetterPosition[] {
	const positions: LetterPosition[] = [];
	let currentRow = word.row;
	let currentCol = word.col;
	let currentDirection = word.direction;

	for (let i = 0; i < word.text.length; i++) {
		positions.push({
			row: currentRow,
			col: currentCol,
			char: word.text[i],
			index: i,
		});

		// Check if there's a bend at the next position
		const bend = word.bends?.find((b) => b.index === i + 1);
		if (bend) {
			currentDirection = bend.direction;
		}

		// Move to next position (if not at end)
		if (i < word.text.length - 1) {
			if (currentDirection === "horizontal") {
				currentCol++;
			} else {
				currentRow++;
			}
		}
	}

	return positions;
}

/**
 * Calculate bounding box for a word with bends
 */
export function calculateWordBounds(word: Word) {
	const positions = calculateWordPositions(word);

	if (positions.length === 0) {
		return {
			minRow: word.row,
			maxRow: word.row,
			minCol: word.col,
			maxCol: word.col,
		};
	}

	const rows = positions.map((p) => p.row);
	const cols = positions.map((p) => p.col);

	return {
		minRow: Math.min(...rows),
		maxRow: Math.max(...rows),
		minCol: Math.min(...cols),
		maxCol: Math.max(...cols),
	};
}

/**
 * Check if a word with bends would overflow the grid
 */
export function wouldWordOverflow(
	word: Word,
	rows: number,
	cols: number,
): boolean {
	const positions = calculateWordPositions(word);

	return positions.some(
		(pos) => pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols,
	);
}

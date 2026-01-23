import { useState } from "react";
import type { Cell, Direction, Word } from "./types";

interface UseCrosswordWordsParams {
	rows: number;
	cols: number;
	cells: Cell[][];
	setCells: React.Dispatch<React.SetStateAction<Cell[][]>>;
}

export function useCrosswordWords({
	rows,
	cols,
	cells,
	setCells,
}: UseCrosswordWordsParams) {
	const [words, setWords] = useState<Word[]>([]);
	const [selectedWord, setSelectedWord] = useState<string | null>(null);

	const placeWord = (
		text: string,
		row: number,
		col: number,
		direction: Direction,
	) => {
		// Keep spaces but convert to uppercase and remove other non-letter chars except spaces
		const processed = text.toUpperCase().replace(/[^A-Z ]/g, "");
		const wordId = `word-${Date.now()}`;
		const newWord: Word = {
			id: wordId,
			text: processed,
			row,
			col,
			direction,
		};

		setCells((prev) => {
			const newCells = prev.map((row) => row.map((cell) => ({ ...cell })));
			let currentRow = row;
			let currentCol = col;

			for (let i = 0; i < processed.length; i++) {
				if (
					currentRow >= rows ||
					currentCol >= cols ||
					currentRow < 0 ||
					currentCol < 0
				) {
					break;
				}

				const char = processed[i];
				if (char === " ") {
					// Make space cells black
					newCells[currentRow][currentCol].isBlack = true;
					newCells[currentRow][currentCol].value = "";
					newCells[currentRow][currentCol].wordId = wordId;
				} else {
					// Skip if cell is already black (from another word's space)
					if (newCells[currentRow][currentCol].isBlack) {
						break;
					}
					newCells[currentRow][currentCol].value = char;
					newCells[currentRow][currentCol].wordId = wordId;
				}

				if (direction === "horizontal") {
					currentCol++;
				} else {
					currentRow++;
				}
			}

			return newCells;
		});

		setWords((prev) => [...prev, newWord]);
		return wordId;
	};

	const moveWord = (wordId: string, newRow: number, newCol: number) => {
		const word = words.find((w) => w.id === wordId);
		if (!word) return;

		// Clamp position to ensure word stays within grid boundaries
		const maxCol =
			word.direction === "horizontal" ? cols - word.text.length : cols - 1;
		const maxRow =
			word.direction === "vertical" ? rows - word.text.length : rows - 1;

		const clampedRow = Math.max(0, Math.min(maxRow, newRow));
		const clampedCol = Math.max(0, Math.min(maxCol, newCol));

		setCells((prev) => {
			const newCells = prev.map((row) => row.map((cell) => ({ ...cell })));

			// Clear old position
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					if (newCells[r][c].wordId === wordId) {
						newCells[r][c].value = "";
						newCells[r][c].wordId = undefined;
						newCells[r][c].isBlack = false;
					}
				}
			}

			// Place at new position using clamped coordinates
			let row = clampedRow;
			let col = clampedCol;
			for (let i = 0; i < word.text.length; i++) {
				if (row >= rows || col >= cols || row < 0 || col < 0) {
					break;
				}

				const char = word.text[i];
				if (char === " ") {
					// Make space cells black
					newCells[row][col].isBlack = true;
					newCells[row][col].value = "";
					newCells[row][col].wordId = wordId;
				} else {
					// Skip if cell is already black (from another word's space)
					if (newCells[row][col].isBlack) {
						break;
					}
					newCells[row][col].value = char;
					newCells[row][col].wordId = wordId;
				}

				if (word.direction === "horizontal") {
					col++;
				} else {
					row++;
				}
			}

			return newCells;
		});

		setWords((prev) =>
			prev.map((w) =>
				w.id === wordId ? { ...w, row: clampedRow, col: clampedCol } : w,
			),
		);
	};

	const deleteWord = (wordId: string) => {
		setCells((prev) => {
			const newCells = prev.map((row) => row.map((cell) => ({ ...cell })));
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					if (newCells[r][c].wordId === wordId) {
						newCells[r][c].value = "";
						newCells[r][c].wordId = undefined;
						newCells[r][c].isBlack = false;
					}
				}
			}
			return newCells;
		});

		setWords((prev) => prev.filter((w) => w.id !== wordId));
		if (selectedWord === wordId) {
			setSelectedWord(null);
		}
	};

	return {
		words,
		selectedWord,
		setSelectedWord,
		placeWord,
		moveWord,
		deleteWord,
	};
}

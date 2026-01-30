import { useState } from "react";
import type { BendPoint, Cell, Direction, Word } from "./types";
import { calculateWordPositions, wouldWordOverflow } from "./word-geometry";

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

		// Create updated word with new position
		const updatedWord = { ...word, row: newRow, col: newCol };

		// Check if word would overflow with new position
		if (wouldWordOverflow(updatedWord, rows, cols)) {
			return; // Don't move if it would overflow
		}

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

			// Place at new position using calculateWordPositions to handle bends
			const positions = calculateWordPositions(updatedWord);
			for (const pos of positions) {
				if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
					const char = pos.char;
					if (char === " ") {
						newCells[pos.row][pos.col].isBlack = true;
						newCells[pos.row][pos.col].value = "";
						newCells[pos.row][pos.col].wordId = wordId;
					} else {
						if (!newCells[pos.row][pos.col].isBlack) {
							newCells[pos.row][pos.col].value = char;
							newCells[pos.row][pos.col].wordId = wordId;
						}
					}
				}
			}

			return newCells;
		});

		setWords((prev) => prev.map((w) => (w.id === wordId ? updatedWord : w)));
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

	const addBend = (
		wordId: string,
		letterIndex: number,
		direction: Direction,
	) => {
		const word = words.find((w) => w.id === wordId);
		if (!word) return;

		const newBends: BendPoint[] = [...(word.bends || [])];

		// Remove any existing bend at this index
		const existingIndex = newBends.findIndex((b) => b.index === letterIndex);
		if (existingIndex >= 0) {
			newBends.splice(existingIndex, 1);
		}

		// Add new bend
		newBends.push({ index: letterIndex, direction });
		newBends.sort((a, b) => a.index - b.index);

		const updatedWord = { ...word, bends: newBends };

		// Check if word would overflow
		if (wouldWordOverflow(updatedWord, rows, cols)) {
			return; // Don't apply bend if it would overflow
		}

		// Clear old cells and place with new bend
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

			// Place with bends
			const positions = calculateWordPositions(updatedWord);
			for (const pos of positions) {
				if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
					const char = pos.char;
					if (char === " ") {
						newCells[pos.row][pos.col].isBlack = true;
						newCells[pos.row][pos.col].value = "";
						newCells[pos.row][pos.col].wordId = wordId;
					} else {
						if (!newCells[pos.row][pos.col].isBlack) {
							newCells[pos.row][pos.col].value = char;
							newCells[pos.row][pos.col].wordId = wordId;
						}
					}
				}
			}

			return newCells;
		});

		setWords((prev) => prev.map((w) => (w.id === wordId ? updatedWord : w)));
	};

	const removeBend = (wordId: string, letterIndex: number) => {
		const word = words.find((w) => w.id === wordId);
		if (!word || !word.bends) return;

		const newBends = word.bends.filter((b) => b.index !== letterIndex);
		const updatedWord = {
			...word,
			bends: newBends.length > 0 ? newBends : undefined,
		};

		// Clear and replace
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

			// Place with remaining bends
			const positions = calculateWordPositions(updatedWord);
			for (const pos of positions) {
				if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
					const char = pos.char;
					if (char === " ") {
						newCells[pos.row][pos.col].isBlack = true;
						newCells[pos.row][pos.col].value = "";
						newCells[pos.row][pos.col].wordId = wordId;
					} else {
						if (!newCells[pos.row][pos.col].isBlack) {
							newCells[pos.row][pos.col].value = char;
							newCells[pos.row][pos.col].wordId = wordId;
						}
					}
				}
			}

			return newCells;
		});

		setWords((prev) => prev.map((w) => (w.id === wordId ? updatedWord : w)));
	};

	const moveWordUp = (wordId: string) => {
		setWords((prev) => {
			const index = prev.findIndex((w) => w.id === wordId);
			if (index <= 0) return prev;

			const newWords = [...prev];
			[newWords[index - 1], newWords[index]] = [
				newWords[index],
				newWords[index - 1],
			];
			return newWords;
		});
	};

	const moveWordDown = (wordId: string) => {
		setWords((prev) => {
			const index = prev.findIndex((w) => w.id === wordId);
			if (index < 0 || index >= prev.length - 1) return prev;

			const newWords = [...prev];
			[newWords[index], newWords[index + 1]] = [
				newWords[index + 1],
				newWords[index],
			];
			return newWords;
		});
	};

	return {
		words,
		selectedWord,
		setSelectedWord,
		placeWord,
		moveWord,
		deleteWord,
		addBend,
		removeBend,
		moveWordUp,
		moveWordDown,
	};
}

import type { Cell, Word } from "./types";
import { calculateWordPositions } from "./word-geometry";

const CELL_SIZE = 40;
const BORDER_WIDTH = 2;
const GRID_GAP = 1;

/**
 * Generates and downloads step-by-step solution images
 * Each image shows the grid with progressively more words filled in
 */
export async function generateStepImages(
	rows: number,
	cols: number,
	words: Word[],
	originalCells: Cell[][],
): Promise<void> {
	if (words.length === 0) {
		alert("No words to generate images for!");
		return;
	}

	for (let step = 0; step <= words.length; step++) {
		const { cells, willHaveContent } = buildCellsForExport(
			rows,
			cols,
			words,
			originalCells,
			step,
		);

		// Render to canvas
		const canvas = renderGridToCanvas(
			cells,
			willHaveContent,
			rows,
			cols,
			words,
			step,
		);

		// Download the image
		canvas.toBlob((blob) => {
			if (blob) {
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				const filename =
					step === 0
						? "crossword-step-00-blank.png"
						: `crossword-step-${step.toString().padStart(2, "0")}-${words[step - 1].text}.png`;
				link.download = filename;
				link.click();
				URL.revokeObjectURL(url);
			}
		});

		// Add a small delay between downloads to avoid browser blocking
		await new Promise((resolve) => setTimeout(resolve, 150));
	}
}

/**
 * Generates one image per word where the active word's cells are highlighted in red.
 * All words remain unsolved so only the active word outline is shown.
 */
export async function generateWordHighlightImages(
	rows: number,
	cols: number,
	words: Word[],
	originalCells: Cell[][],
): Promise<void> {
	if (words.length === 0) {
		alert("No words to generate images for!");
		return;
	}

	for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
		const { cells, willHaveContent } = buildCellsForExport(
			rows,
			cols,
			words,
			originalCells,
			0,
		);

		const highlightedCellKeys = new Set<string>();
		const positions = calculateWordPositions(words[wordIndex]);
		for (const pos of positions) {
			if (
				pos.char !== " " &&
				pos.row >= 0 &&
				pos.row < rows &&
				pos.col >= 0 &&
				pos.col < cols
			) {
				highlightedCellKeys.add(getCellKey(pos.row, pos.col));
			}
		}

		const canvas = renderGridToCanvas(
			cells,
			willHaveContent,
			rows,
			cols,
			words,
			wordIndex,
			highlightedCellKeys,
		);

		canvas.toBlob((blob) => {
			if (blob) {
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				const filename = `crossword-highlight-${(wordIndex + 1).toString().padStart(2, "0")}-${words[wordIndex].text}.png`;
				link.download = filename;
				link.click();
				URL.revokeObjectURL(url);
			}
		});

		await new Promise((resolve) => setTimeout(resolve, 150));
	}
}

function buildCellsForExport(
	rows: number,
	cols: number,
	words: Word[],
	originalCells: Cell[][],
	solvedWordCount: number,
): { cells: Cell[][]; willHaveContent: boolean[][] } {
	// Create cells based on original cells (to preserve customizations)
	const cells: Cell[][] = Array.from({ length: rows }, (_, row) =>
		Array.from({ length: cols }, (_, col) => ({
			value: "",
			isBlack: originalCells[row][col].isBlack,
			customization: originalCells[row][col].customization,
		})),
	);

	// Track which cells will eventually have content
	const willHaveContent: boolean[][] = Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => false),
	);

	// First pass: Mark all cells that will eventually have content (from all words)
	for (const word of words) {
		const positions = calculateWordPositions(word);
		for (const pos of positions) {
			if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
				willHaveContent[pos.row][pos.col] = true;
				if (pos.char === " ") {
					cells[pos.row][pos.col].isBlack = true;
				}
			}
		}
	}

	// Second pass: Fill in letters for words up to solvedWordCount
	if (solvedWordCount > 0) {
		for (let i = 0; i < solvedWordCount; i++) {
			const word = words[i];
			const positions = calculateWordPositions(word);

			for (const pos of positions) {
				if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
					const char = pos.char;
					if (char !== " " && !cells[pos.row][pos.col].isBlack) {
						cells[pos.row][pos.col].value = char;
					}
				}
			}
		}
	}

	return { cells, willHaveContent };
}

/**
 * Renders the grid to a canvas element
 */
function renderGridToCanvas(
	cells: Cell[][],
	willHaveContent: boolean[][],
	rows: number,
	cols: number,
	words: Word[] = [],
	_currentStep: number = 0,
	highlightedCellKeys: Set<string> = new Set(),
): HTMLCanvasElement {
	const totalWidth =
		cols * (CELL_SIZE + GRID_GAP) + GRID_GAP + BORDER_WIDTH * 2;
	const totalHeight =
		rows * (CELL_SIZE + GRID_GAP) + GRID_GAP + BORDER_WIDTH * 2;

	const canvas = document.createElement("canvas");
	canvas.width = totalWidth;
	canvas.height = totalHeight;
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not get canvas context");
	}

	// Fill background (transparent or white)
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, totalWidth, totalHeight);

	// Draw cells that will have content
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const cell = cells[row][col];

			// Skip cells that will never have content
			if (!willHaveContent[row][col]) {
				continue;
			}

			const x = BORDER_WIDTH + col * (CELL_SIZE + GRID_GAP) + GRID_GAP;
			const y = BORDER_WIDTH + row * (CELL_SIZE + GRID_GAP) + GRID_GAP;

			if (cell.isBlack) {
				// Render black cells (spaces in words)
				ctx.fillStyle = "#000000";
				ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
			} else {
				// Cell background (white with black border)
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

				// Cell border
				ctx.strokeStyle = "#000000";
				ctx.lineWidth = 2;
				ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

				// Cell value (if it has been filled in this step)
				if (cell.value) {
					ctx.fillStyle = "#000000";
					ctx.font = "bold 24px Arial";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText(
						cell.value.toUpperCase(),
						x + CELL_SIZE / 2,
						y + CELL_SIZE / 2,
					);
				}
			}

			// Draw red border if customization is set
			if (cell.customization?.hasRedBorder) {
				ctx.strokeStyle = "#ef4444"; // red-500
				ctx.lineWidth = 4;
				ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
			}

			// Draw black borders on specific sides if customization is set
			const blackBorders = cell.customization?.blackBorders;
			if (blackBorders) {
				ctx.strokeStyle = "#000000";
				ctx.lineWidth = 5;

				if (blackBorders.top) {
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + CELL_SIZE, y);
					ctx.stroke();
				}
				if (blackBorders.right) {
					ctx.beginPath();
					ctx.moveTo(x + CELL_SIZE, y);
					ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
					ctx.stroke();
				}
				if (blackBorders.bottom) {
					ctx.beginPath();
					ctx.moveTo(x, y + CELL_SIZE);
					ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
					ctx.stroke();
				}
				if (blackBorders.left) {
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x, y + CELL_SIZE);
					ctx.stroke();
				}
			}
		}
	}

	const wordMembership = buildWordMembershipMap(rows, cols, words);
	drawNeighborWordSeparators(
		ctx,
		cells,
		willHaveContent,
		rows,
		cols,
		wordMembership,
	);

	drawHighlightedPerimeter(ctx, highlightedCellKeys);

	// Draw bend arrows for all words (structure should be visible even on blank image)
	for (const word of words) {
		if (word.bends && word.bends.length > 0) {
			const positions = calculateWordPositions(word);

			for (const pos of positions) {
				if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
					// Check if there's a bend at this position
					const bend = word.bends?.find((b) => b.index === pos.index);
					if (bend) {
						const x =
							BORDER_WIDTH + pos.col * (CELL_SIZE + GRID_GAP) + GRID_GAP;
						const y =
							BORDER_WIDTH + pos.row * (CELL_SIZE + GRID_GAP) + GRID_GAP;

						// Get direction before bend
						const fromDirection = getDirectionBeforeBend(word, pos.index);

						// Draw arrow with position based on bend type
						ctx.fillStyle = "#0066cc";
						ctx.font = "bold 16px Arial";

						let arrowChar = "";
						let arrowX: number;
						let arrowY: number;

						if (
							fromDirection === "horizontal" &&
							bend.direction === "vertical"
						) {
							// ⤵ at top right
							arrowChar = "⤵";
							ctx.textAlign = "right";
							ctx.textBaseline = "top";
							arrowX = x + CELL_SIZE - 3;
							arrowY = y + 1;
						} else if (
							fromDirection === "vertical" &&
							bend.direction === "horizontal"
						) {
							// ↳ at bottom left
							arrowChar = "↳";
							ctx.textAlign = "left";
							ctx.textBaseline = "bottom";
							arrowX = x + 3;
							arrowY = y + CELL_SIZE - 1;
						} else if (bend.direction === "horizontal") {
							arrowChar = "→";
							ctx.textAlign = "right";
							ctx.textBaseline = "top";
							arrowX = x + CELL_SIZE - 3;
							arrowY = y + 1;
						} else {
							arrowChar = "↓";
							ctx.textAlign = "right";
							ctx.textBaseline = "top";
							arrowX = x + CELL_SIZE - 3;
							arrowY = y + 1;
						}

						ctx.fillText(arrowChar, arrowX, arrowY);
					}
				}
			}
		}
	}

	return canvas;
}

/**
 * Get the direction before a specific bend point
 */
function getDirectionBeforeBend(
	word: Word,
	bendIndex: number,
): "horizontal" | "vertical" {
	const previousBends = word.bends?.filter((b) => b.index < bendIndex) || [];
	if (previousBends.length > 0) {
		const lastBend = previousBends[previousBends.length - 1];
		return lastBend.direction;
	}
	return word.direction;
}

function getCellKey(row: number, col: number): string {
	return `${row}-${col}`;
}

function drawHighlightedPerimeter(
	ctx: CanvasRenderingContext2D,
	highlightedCellKeys: Set<string>,
): void {
	if (highlightedCellKeys.size === 0) {
		return;
	}

	ctx.strokeStyle = "#dc2626";
	ctx.lineWidth = 4;
	ctx.lineCap = "butt";

	for (const key of highlightedCellKeys) {
		const [rowText, colText] = key.split("-");
		const row = Number(rowText);
		const col = Number(colText);
		const x = BORDER_WIDTH + col * (CELL_SIZE + GRID_GAP) + GRID_GAP;
		const y = BORDER_WIDTH + row * (CELL_SIZE + GRID_GAP) + GRID_GAP;

		if (!highlightedCellKeys.has(getCellKey(row - 1, col))) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + CELL_SIZE, y);
			ctx.stroke();
		}

		if (!highlightedCellKeys.has(getCellKey(row, col + 1))) {
			ctx.beginPath();
			ctx.moveTo(x + CELL_SIZE, y);
			ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
			ctx.stroke();
		}

		if (!highlightedCellKeys.has(getCellKey(row + 1, col))) {
			ctx.beginPath();
			ctx.moveTo(x, y + CELL_SIZE);
			ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
			ctx.stroke();
		}

		if (!highlightedCellKeys.has(getCellKey(row, col - 1))) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, y + CELL_SIZE);
			ctx.stroke();
		}
	}
}

function buildWordMembershipMap(
	rows: number,
	cols: number,
	words: Word[],
): Map<string, Set<string>> {
	const membership = new Map<string, Set<string>>();

	for (const word of words) {
		const positions = calculateWordPositions(word);
		for (const pos of positions) {
			if (
				pos.char === " " ||
				pos.row < 0 ||
				pos.row >= rows ||
				pos.col < 0 ||
				pos.col >= cols
			) {
				continue;
			}

			const key = getCellKey(pos.row, pos.col);
			if (!membership.has(key)) {
				membership.set(key, new Set<string>());
			}
			membership.get(key)?.add(word.id);
		}
	}

	return membership;
}

function drawNeighborWordSeparators(
	ctx: CanvasRenderingContext2D,
	cells: Cell[][],
	willHaveContent: boolean[][],
	rows: number,
	cols: number,
	wordMembership: Map<string, Set<string>>,
): void {
	ctx.strokeStyle = "#111111";
	ctx.lineWidth = 6;
	ctx.lineCap = "butt";

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			if (!willHaveContent[row][col] || cells[row][col].isBlack) {
				continue;
			}

			const x = BORDER_WIDTH + col * (CELL_SIZE + GRID_GAP) + GRID_GAP;
			const y = BORDER_WIDTH + row * (CELL_SIZE + GRID_GAP) + GRID_GAP;

			if (
				col + 1 < cols &&
				shouldDrawWordSeparator(
					row,
					col,
					row,
					col + 1,
					cells,
					willHaveContent,
					wordMembership,
				)
			) {
				const separatorX = x + CELL_SIZE;
				ctx.beginPath();
				ctx.moveTo(separatorX, y);
				ctx.lineTo(separatorX, y + CELL_SIZE);
				ctx.stroke();
			}

			if (
				row + 1 < rows &&
				shouldDrawWordSeparator(
					row,
					col,
					row + 1,
					col,
					cells,
					willHaveContent,
					wordMembership,
				)
			) {
				const separatorY = y + CELL_SIZE;
				ctx.beginPath();
				ctx.moveTo(x, separatorY);
				ctx.lineTo(x + CELL_SIZE, separatorY);
				ctx.stroke();
			}
		}
	}
}

function shouldDrawWordSeparator(
	rowA: number,
	colA: number,
	rowB: number,
	colB: number,
	cells: Cell[][],
	willHaveContent: boolean[][],
	wordMembership: Map<string, Set<string>>,
): boolean {
	if (!willHaveContent[rowB][colB] || cells[rowB][colB].isBlack) {
		return false;
	}

	const wordsA = wordMembership.get(getCellKey(rowA, colA));
	const wordsB = wordMembership.get(getCellKey(rowB, colB));
	if (!wordsA || !wordsB) {
		return false;
	}

	for (const wordId of wordsA) {
		if (wordsB.has(wordId)) {
			// Adjacent cells are part of at least one shared word path, so no separator.
			return false;
		}
	}

	return true;
}

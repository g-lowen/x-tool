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
): Promise<void> {
	if (words.length === 0) {
		alert("No words to generate images for!");
		return;
	}

	for (let step = 0; step <= words.length; step++) {
		// Create empty cells
		const cells: Cell[][] = Array.from({ length: rows }, () =>
			Array.from({ length: cols }, () => ({
				value: "",
				isBlack: false,
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

		// Second pass: Fill in letters for words up to current step (skip for step 0)
		if (step > 0) {
			for (let i = 0; i < step; i++) {
				const word = words[i];
				const positions = calculateWordPositions(word);

				for (const pos of positions) {
					if (
						pos.row >= 0 &&
						pos.row < rows &&
						pos.col >= 0 &&
						pos.col < cols
					) {
						const char = pos.char;
						if (char !== " " && !cells[pos.row][pos.col].isBlack) {
							cells[pos.row][pos.col].value = char;
						}
					}
				}
			}
		}

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

	alert(`Successfully generated ${words.length + 1} step images!`);
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
	currentStep: number = 0,
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
		}
	}

	// Draw bend arrows for words up to current step
	if (currentStep > 0) {
		for (let i = 0; i < currentStep; i++) {
			const word = words[i];
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

						// Draw arrow
						ctx.fillStyle = "#0066cc";
						ctx.font = "bold 16px Arial";
						ctx.textAlign = "right";
						ctx.textBaseline = "top";

						let arrowChar = "";
						if (
							fromDirection === "horizontal" &&
							bend.direction === "vertical"
						) {
							arrowChar = "⤵";
						} else if (
							fromDirection === "vertical" &&
							bend.direction === "horizontal"
						) {
							arrowChar = "↴";
						} else if (bend.direction === "horizontal") {
							arrowChar = "→";
						} else {
							arrowChar = "↓";
						}

						ctx.fillText(arrowChar, x + CELL_SIZE - 3, y + 1);
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

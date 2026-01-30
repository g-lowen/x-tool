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

	for (let step = 1; step <= words.length; step++) {
		// Create empty cells
		const cells: Cell[][] = Array.from({ length: rows }, () =>
			Array.from({ length: cols }, () => ({
				value: "",
				isBlack: false,
			})),
		);

		// Add words from step 1 to current step
		for (let i = 0; i < step; i++) {
			const word = words[i];
			const positions = calculateWordPositions(word);

			for (const pos of positions) {
				if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
					const char = pos.char;
					if (char === " ") {
						cells[pos.row][pos.col].isBlack = true;
						cells[pos.row][pos.col].value = "";
					} else {
						if (!cells[pos.row][pos.col].isBlack) {
							cells[pos.row][pos.col].value = char;
						}
					}
				}
			}
		}

		// Render to canvas
		const canvas = renderGridToCanvas(cells, rows, cols);

		// Download the image
		canvas.toBlob((blob) => {
			if (blob) {
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `crossword-step-${step.toString().padStart(2, "0")}-${words[step - 1].text}.png`;
				link.click();
				URL.revokeObjectURL(url);
			}
		});

		// Add a small delay between downloads to avoid browser blocking
		await new Promise((resolve) => setTimeout(resolve, 150));
	}

	alert(`Successfully generated ${words.length} step images!`);
}

/**
 * Renders the grid to a canvas element
 */
function renderGridToCanvas(
	cells: Cell[][],
	rows: number,
	cols: number,
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

	// Draw only cells with letters or black cells (spaces)
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const cell = cells[row][col];

			// Skip empty cells (no value and not black)
			if (!cell.value && !cell.isBlack) {
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

				// Cell value
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

	return canvas;
}

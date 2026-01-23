import { GRID_TOTAL_CELL_SIZE } from "./constants";

export function createSnapToGridModifier(gridSize: number) {
	return (args: {
		transform: { x: number; y: number; scaleX: number; scaleY: number };
	}) => {
		const { transform } = args;

		return {
			...transform,
			x: Math.round(transform.x / gridSize) * gridSize,
			y: Math.round(transform.y / gridSize) * gridSize,
		};
	};
}

export function createTopLeftCornerCollision() {
	return (args: any) => {
		const { collisionRect, droppableContainers } = args;

		if (!collisionRect) return [];

		const topLeftPoint = {
			x: collisionRect.left,
			y: collisionRect.top,
		};

		const collisions = [];

		for (const container of droppableContainers.values()) {
			const { id, rect } = container;
			if (!rect.current) continue;

			const droppableRect = rect.current;

			if (
				topLeftPoint.x >= droppableRect.left &&
				topLeftPoint.x <= droppableRect.right &&
				topLeftPoint.y >= droppableRect.top &&
				topLeftPoint.y <= droppableRect.bottom
			) {
				collisions.push({ id });
			}
		}

		return collisions;
	};
}

export function calculateGridPosition(
	delta: { x: number; y: number },
	currentRow: number,
	currentCol: number,
	rows: number,
	cols: number,
	wordLength: number,
	direction: "horizontal" | "vertical",
) {
	const deltaRows = Math.round(delta.y / GRID_TOTAL_CELL_SIZE);
	const deltaCols = Math.round(delta.x / GRID_TOTAL_CELL_SIZE);

	const newRow = currentRow + deltaRows;
	const newCol = currentCol + deltaCols;

	// Simple clamping - just ensure within grid bounds
	// Actual overflow checking happens in moveWord with calculateWordPositions
	const clampedRow = Math.max(0, Math.min(rows - 1, newRow));
	const clampedCol = Math.max(0, Math.min(cols - 1, newCol));

	return { row: clampedRow, col: clampedCol };
}

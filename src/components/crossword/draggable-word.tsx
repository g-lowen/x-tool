import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GRID_BORDER_SIZE, GRID_TOTAL_CELL_SIZE } from "./constants";
import type { Word } from "./types";
import { calculateWordBounds, calculateWordPositions } from "./word-geometry";

interface DraggableWordProps {
	word: Word;
	isSelected: boolean;
	onSelect: () => void;
}

export function DraggableWord({
	word,
	isSelected,
	onSelect,
}: DraggableWordProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: word.id,
			data: {
				row: word.row,
				col: word.col,
				length: word.text.length,
				direction: word.direction,
			},
		});

	const style = {
		transform: CSS.Translate.toString(transform),
		transformOrigin: "0 0",
	};

	const positions = calculateWordPositions(word);
	const bounds = calculateWordBounds(word);
	const width = (bounds.maxCol - bounds.minCol + 1) * GRID_TOTAL_CELL_SIZE - 1;
	const height = (bounds.maxRow - bounds.minRow + 1) * GRID_TOTAL_CELL_SIZE - 1;

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			className={`absolute ${isDragging ? "opacity-50" : ""}`}
			style={{
				top: `${bounds.minRow * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE}px`,
				left: `${bounds.minCol * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE}px`,
				width: `${width}px`,
				height: `${height}px`,
				...style,
			}}
		>
			{/* Render each letter at its absolute position */}
			{positions.map((pos, idx) => {
				const offsetRow = pos.row - bounds.minRow;
				const offsetCol = pos.col - bounds.minCol;

				return (
					<div
						key={`${word.id}-${idx}`}
						{...listeners}
						onClick={onSelect}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								onSelect();
							}
						}}
						role="button"
						tabIndex={0}
						className={`absolute flex items-center justify-center font-bold text-lg pointer-events-auto cursor-move ${
							pos.char === " " ? "bg-black" : "bg-white"
						} ${isSelected ? "ring-2 ring-blue-500" : ""}`}
						style={{
							top: `${offsetRow * GRID_TOTAL_CELL_SIZE}px`,
							left: `${offsetCol * GRID_TOTAL_CELL_SIZE}px`,
							width: "40px",
							height: "40px",
							border: "1px solid #000",
						}}
					>
						<span className="print-cell-value">
							{pos.char === " " ? "" : pos.char}
						</span>
					</div>
				);
			})}
		</div>
	);
}

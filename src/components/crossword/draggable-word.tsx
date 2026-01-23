import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GRID_BORDER_SIZE, GRID_TOTAL_CELL_SIZE } from "./constants";
import type { Word } from "./types";
import { calculateWordBounds, calculateWordPositions } from "./word-geometry";

interface DraggableWordProps {
	word: Word;
	isSelected: boolean;
	onSelect: () => void;
	onDelete: () => void;
}

export function DraggableWord({
	word,
	isSelected,
	onSelect,
	onDelete,
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
			{...listeners}
			{...attributes}
			onClick={onSelect}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onSelect();
				}
			}}
			role="button"
			tabIndex={0}
			className={`absolute pointer-events-auto cursor-move ${
				isDragging ? "opacity-50" : ""
			} ${isSelected ? "ring-2 ring-blue-500 rounded" : ""}`}
			style={{
				top: `${word.row * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE}px`,
				left: `${word.col * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE}px`,
				width: `${width}px`,
				height: `${height}px`,
				...style,
			}}
		>
			{/* Render each letter at its absolute position */}
			{positions.map((pos, idx) => {
				const offsetRow = pos.row - word.row;
				const offsetCol = pos.col - word.col;

				return (
					<div
						key={`${word.id}-${idx}`}
						className={`absolute flex items-center justify-center font-bold text-lg ${
							pos.char === " " ? "bg-black" : "bg-white"
						}`}
						style={{
							top: `${offsetRow * GRID_TOTAL_CELL_SIZE}px`,
							left: `${offsetCol * GRID_TOTAL_CELL_SIZE}px`,
							width: "40px",
							height: "40px",
							border: "1px solid #000",
						}}
					>
						{pos.char === " " ? "" : pos.char}
					</div>
				);
			})}
			{/* Delete button */}
			{isSelected && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 z-10"
				>
					×
				</button>
			)}
		</div>
	);
}

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GRID_BORDER_SIZE, GRID_TOTAL_CELL_SIZE } from "./constants";
import type { Word } from "./types";

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
				width:
					word.direction === "horizontal"
						? `${word.text.length * GRID_TOTAL_CELL_SIZE - 1}px`
						: "40px",
				height:
					word.direction === "vertical"
						? `${word.text.length * GRID_TOTAL_CELL_SIZE - 1}px`
						: "40px",
				...style,
			}}
		>
			<div
				className={`h-full flex ${
					word.direction === "horizontal" ? "flex-row" : "flex-col"
				}`}
			>
				{word.text.split("").map((letter, idx) => (
					<div
						key={`${word.id}-${idx}`}
						className={`flex items-center justify-center font-bold text-lg ${
							letter === " " ? "bg-black" : "bg-white"
						}`}
						style={{
							width: "40px",
							height: "40px",
							border: "1px solid #000",
							marginRight:
								word.direction === "horizontal" && idx < word.text.length - 1
									? "1px"
									: "0",
							marginBottom:
								word.direction === "vertical" && idx < word.text.length - 1
									? "1px"
									: "0",
						}}
					>
						{letter === " " ? "" : letter}
					</div>
				))}
			</div>
			{isSelected && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
				>
					×
				</button>
			)}
		</div>
	);
}

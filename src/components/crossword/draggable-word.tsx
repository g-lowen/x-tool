import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { GRID_BORDER_SIZE, GRID_TOTAL_CELL_SIZE } from "./constants";
import type { Direction, Word } from "./types";
import { calculateWordBounds, calculateWordPositions } from "./word-geometry";

interface DraggableWordProps {
	word: Word;
	isSelected: boolean;
	onSelect: () => void;
	onAddBend: (
		wordId: string,
		letterIndex: number,
		direction: Direction,
	) => void;
	onRemoveBend: (wordId: string, letterIndex: number) => void;
}

export function DraggableWord({
	word,
	isSelected,
	onSelect,
	onAddBend,
	onRemoveBend,
}: DraggableWordProps) {
	const [clickedLetterIndex, setClickedLetterIndex] = useState<number | null>(
		null,
	);

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

	const handleLetterClick = (e: React.MouseEvent, idx: number) => {
		e.stopPropagation();
		if (isSelected) {
			// If already selected, toggle the clicked letter for bend controls
			setClickedLetterIndex(clickedLetterIndex === idx ? null : idx);
		} else {
			// If not selected, select the word first
			onSelect();
		}
	};

	// Check if there's a bend after this letter
	const getBendAfterLetter = (idx: number) => {
		return word.bends?.find((b) => b.index === idx + 1);
	};

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
				const bendAfter = getBendAfterLetter(idx);
				const isLastLetter = idx === word.text.length - 1;
				const showBendControls =
					isSelected && clickedLetterIndex === idx && !isLastLetter;

				return (
					<div
						key={`${word.id}-${idx}`}
						className="absolute pointer-events-none"
						style={{
							top: `${offsetRow * GRID_TOTAL_CELL_SIZE}px`,
							left: `${offsetCol * GRID_TOTAL_CELL_SIZE}px`,
						}}
					>
						{/* Bend control buttons above the letter */}
						{showBendControls && (
							<div className="absolute -top-10 left-0 flex gap-1 bg-white border-2 border-blue-500 rounded p-1 shadow-lg z-50 pointer-events-auto">
								{bendAfter ? (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onRemoveBend(word.id, idx + 1);
											setClickedLetterIndex(null);
										}}
										className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
										title="Remove bend"
									>
										Remove
									</button>
								) : (
									<>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onAddBend(word.id, idx + 1, "horizontal");
												setClickedLetterIndex(null);
											}}
											className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
											title="Bend horizontal"
										>
											→
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onAddBend(word.id, idx + 1, "vertical");
												setClickedLetterIndex(null);
											}}
											className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
											title="Bend vertical"
										>
											↓
										</button>
									</>
								)}
							</div>
						)}

						{/* Letter cell */}
						<div
							{...listeners}
							onClick={(e) => handleLetterClick(e, idx)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									onSelect();
								}
							}}
							role="button"
							tabIndex={0}
							className={`flex items-center justify-center font-bold text-lg pointer-events-auto cursor-move ${
								pos.char === " " ? "bg-black" : "bg-white"
							} ${isSelected ? "ring-2 ring-blue-500" : ""}`}
							style={{
								width: "40px",
								height: "40px",
								border: "1px solid #000",
							}}
						>
							<span className="print-cell-value">
								{pos.char === " " ? "" : pos.char}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

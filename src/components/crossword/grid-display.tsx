import { GRID_BORDER_SIZE, GRID_TOTAL_CELL_SIZE } from "./constants";
import { DraggableWord } from "./draggable-word";
import { GridCell } from "./grid-cell";
import type { Cell, Word } from "./types";

interface GridDisplayProps {
	rows: number;
	cols: number;
	cells: Cell[][];
	selectedCell: { row: number; col: number } | null;
	onCellClick: (row: number, col: number) => void;
	onCellContextMenu: (row: number, col: number) => void;
	words: Word[];
	selectedWordId: string | null;
	onSelectWord: (wordId: string) => void;
	onDeleteWord: (wordId: string) => void;
	draggingWordId: string | null;
}

export function GridDisplay({
	rows,
	cols,
	cells,
	selectedCell,
	onCellClick,
	onCellContextMenu,
	words,
	selectedWordId,
	onSelectWord,
	onDeleteWord,
	draggingWordId,
}: GridDisplayProps) {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="text-sm text-gray-600">
				{rows} × {cols} grid
			</div>

			<div className="relative">
				<div
					className="inline-grid gap-px bg-black border-2 border-black"
					style={{
						gridTemplateColumns: `repeat(${cols}, 40px)`,
						gridTemplateRows: `repeat(${rows}, 40px)`,
					}}
				>
					{cells.map((row, rowIndex) =>
						row.map((cell, colIndex) => {
							const isSelected =
								selectedCell?.row === rowIndex &&
								selectedCell?.col === colIndex;

							// Hide cells that belong to the word being dragged
							const isDraggingCell = !!(
								draggingWordId && cell.wordId === draggingWordId
							);

							return (
								<GridCell
									key={`${rowIndex}-${colIndex}`}
									rowIndex={rowIndex}
									colIndex={colIndex}
									cell={cell}
									isSelected={isSelected}
									isDragging={isDraggingCell}
									onClick={() => onCellClick(rowIndex, colIndex)}
									onContextMenu={(e) => {
										e.preventDefault();
										if (!cell.isBlack) {
											onCellContextMenu(rowIndex, colIndex);
										}
									}}
								/>
							);
						}),
					)}
				</div>

				{/* Draggable words overlay */}
				<div
					className="absolute top-0 left-0 pointer-events-none"
					style={{
						width: `${cols * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE + 1}px`,
						height: `${rows * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE + 1}px`,
					}}
				>
					{words.map((word) => (
						<DraggableWord
							key={word.id}
							word={word}
							isSelected={selectedWordId === word.id}
							onSelect={() => onSelectWord(word.id)}
							onDelete={() => onDeleteWord(word.id)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

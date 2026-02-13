import { GRID_BORDER_SIZE, GRID_TOTAL_CELL_SIZE } from "./constants";
import { DraggableWord } from "./draggable-word";
import { GridCell } from "./grid-cell";
import type { Cell, Direction, Word } from "./types";

interface GridDisplayProps {
	rows: number;
	cols: number;
	cells: Cell[][];
	selectedCell: { row: number; col: number } | null;
	onCellClick: (row: number, col: number) => void;
	onCellContextMenu: (row: number, col: number, e: React.MouseEvent) => void;
	words: Word[];
	selectedWordId: string | null;
	onSelectWord: (wordId: string) => void;
	draggingWordId: string | null;
	onAddBend: (
		wordId: string,
		letterIndex: number,
		direction: Direction,
	) => void;
	onRemoveBend: (wordId: string, letterIndex: number) => void;
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
	draggingWordId,
	onAddBend,
	onRemoveBend,
}: GridDisplayProps) {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="text-sm text-gray-600 no-print">
				{rows} × {cols} grid
			</div>

			<div className="relative">
				<div
					className="inline-grid gap-px bg-black border-2 border-black print-hide-grid"
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
											onCellContextMenu(rowIndex, colIndex, e);
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
							onAddBend={onAddBend}
							onRemoveBend={onRemoveBend}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

import { GRID_BORDER_SIZE, GRID_TOTAL_CELL_SIZE } from "./constants";
import { DraggableWord } from "./draggable-word";
import { GridCell } from "./grid-cell";
import type { Cell, Direction, Word } from "./types";
import { calculateWordPositions } from "./word-geometry";

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
	const wordMembership = buildWordMembershipMap(rows, cols, words);
	const separatorSegments = buildSeparatorSegments(
		rows,
		cols,
		cells,
		wordMembership,
	);

	return (
		<div className="flex flex-col gap-3">
			<div className="w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-sm max-w-[calc(100vw-2rem)] max-h-[70vh] print:max-w-none print:max-h-none print:overflow-visible">
				<div className="relative w-max">
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
											onCellContextMenu(rowIndex, colIndex, e);
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
								onCellContextMenu={onCellContextMenu}
							/>
						))}
					</div>

					<div
						className="absolute top-0 left-0 pointer-events-none z-30"
						style={{
							width: `${cols * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE + 1}px`,
							height: `${rows * GRID_TOTAL_CELL_SIZE + GRID_BORDER_SIZE + 1}px`,
						}}
					>
						{separatorSegments.map((segment) => {
							if (segment.orientation === "vertical") {
								return (
									<div
										key={`v-${segment.row}-${segment.col}`}
										className="absolute bg-black"
										style={{
											left: `${GRID_BORDER_SIZE + segment.col * GRID_TOTAL_CELL_SIZE + 37}px`,
											top: `${GRID_BORDER_SIZE + segment.row * GRID_TOTAL_CELL_SIZE}px`,
											width: "6px",
											height: "40px",
										}}
									/>
								);
							}

							return (
								<div
									key={`h-${segment.row}-${segment.col}`}
									className="absolute bg-black"
									style={{
										left: `${GRID_BORDER_SIZE + segment.col * GRID_TOTAL_CELL_SIZE}px`,
										top: `${GRID_BORDER_SIZE + segment.row * GRID_TOTAL_CELL_SIZE + 37}px`,
										width: "40px",
										height: "6px",
									}}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

function buildSeparatorSegments(
	rows: number,
	cols: number,
	cells: Cell[][],
	wordMembership: Map<string, Set<string>>,
): Array<{ row: number; col: number; orientation: "vertical" | "horizontal" }> {
	const segments: Array<{
		row: number;
		col: number;
		orientation: "vertical" | "horizontal";
	}> = [];

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			if (col + 1 < cols) {
				if (
					shouldDrawWordSeparator(row, col, row, col + 1, cells, wordMembership)
				) {
					segments.push({ row, col, orientation: "vertical" });
				}
			}

			if (row + 1 < rows) {
				if (
					shouldDrawWordSeparator(row, col, row + 1, col, cells, wordMembership)
				) {
					segments.push({ row, col, orientation: "horizontal" });
				}
			}
		}
	}

	return segments;
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

function shouldDrawWordSeparator(
	rowA: number,
	colA: number,
	rowB: number,
	colB: number,
	cells: Cell[][],
	wordMembership: Map<string, Set<string>>,
): boolean {
	if (cells[rowA][colA].isBlack || cells[rowB][colB].isBlack) {
		return false;
	}

	const wordsA = wordMembership.get(getCellKey(rowA, colA));
	const wordsB = wordMembership.get(getCellKey(rowB, colB));
	if (!wordsA || !wordsB) {
		return false;
	}

	for (const wordId of wordsA) {
		if (wordsB.has(wordId)) {
			return false;
		}
	}

	return true;
}

function getCellKey(row: number, col: number): string {
	return `${row}-${col}`;
}

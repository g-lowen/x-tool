import {
	DndContext,
	type DragEndEvent,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { CellCustomizationMenu } from "./crossword/cell-customization-menu";
import { GRID_TOTAL_CELL_SIZE } from "./crossword/constants";
import { ControlPanel } from "./crossword/control-panel";
import { GridDisplay } from "./crossword/grid-display";
import {
	generateStepImages,
	generateWordHighlightImages,
} from "./crossword/step-image-generator";
import type { CrosswordGridProps, Direction } from "./crossword/types";
import { useCrosswordGrid } from "./crossword/use-crossword-grid";
import { useCrosswordWords } from "./crossword/use-crossword-words";
import {
	calculateGridPosition,
	createSnapToGridModifier,
	createTopLeftCornerCollision,
} from "./crossword/utils";

export function CrosswordGrid({
	initialRows = 30,
	initialCols = 40,
}: CrosswordGridProps) {
	const grid = useCrosswordGrid(initialRows, initialCols);
	const wordManager = useCrosswordWords({
		rows: grid.rows,
		cols: grid.cols,
		cells: grid.cells,
		setCells: grid.setCells,
	});

	const [direction, setDirection] = useState<Direction>("horizontal");
	const [inputText, setInputText] = useState("");
	const [draggingWordId, setDraggingWordId] = useState<string | null>(null);
	const [printWithSolution, setPrintWithSolution] = useState(false);
	const [customizationMenu, setCustomizationMenu] = useState<{
		row: number;
		col: number;
		x: number;
		y: number;
	} | null>(null);

	const handlePlaceWord = () => {
		if (!grid.selectedCell || !inputText.trim()) return;
		wordManager.placeWord(
			inputText,
			grid.selectedCell.row,
			grid.selectedCell.col,
			direction,
		);
		setInputText("");
	};

	const handleDeleteWord = (wordId: string) => {
		wordManager.deleteWord(wordId);
		setInputText("");
	};

	const snapToGridModifier = createSnapToGridModifier(GRID_TOTAL_CELL_SIZE);
	const topLeftCornerCollision = createTopLeftCornerCollision();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over, delta } = event;
		const wordId = active.id as string;
		const word = wordManager.words.find((w) => w.id === wordId);
		setDraggingWordId(null);

		if (word) {
			if (over) {
				const [dropRow, dropCol] = (over.id as string).split("-").map(Number);
				// Let moveWord handle overflow checking with actual bent positions
				wordManager.moveWord(wordId, dropRow, dropCol);
			} else if (delta) {
				const { row, col } = calculateGridPosition(
					delta,
					word.row,
					word.col,
					grid.rows,
					grid.cols,
					word.text.length,
					word.direction,
				);
				wordManager.moveWord(wordId, row, col);
			}
		}
	};

	const handleDragStart = (event: DragStartEvent) => {
		setDraggingWordId(event.active.id as string);
	};

	const handleGenerateStepImages = async () => {
		if (wordManager.words.length === 0) {
			alert("Add some words first!");
			return;
		}
		await generateStepImages(
			grid.rows,
			grid.cols,
			wordManager.words,
			grid.cells,
		);
	};

	const handleGenerateHighlightImages = async () => {
		if (wordManager.words.length === 0) {
			alert("Add some words first!");
			return;
		}
		await generateWordHighlightImages(
			grid.rows,
			grid.cols,
			wordManager.words,
			grid.cells,
		);
	};

	const handleBackgroundClick = (e: React.MouseEvent) => {
		// Only deselect if clicking directly on the background div, not its children
		if (e.target === e.currentTarget) {
			grid.setSelectedCell(null);
			wordManager.setSelectedWord(null);
		}
	};

	const handleCellContextMenu = (
		row: number,
		col: number,
		e: React.MouseEvent,
	) => {
		e.preventDefault();
		setCustomizationMenu({
			row,
			col,
			x: e.clientX,
			y: e.clientY,
		});
	};

	const handleMakeBlack = (row: number, col: number) => {
		const cell = grid.cells[row][col];
		grid.customizeCell(row, col, { isBlack: !cell.isBlack });
	};

	const handleToggleRedBorder = (row: number, col: number) => {
		const cell = grid.cells[row][col];
		const hasRedBorder = cell.customization?.hasRedBorder ?? false;
		grid.customizeCell(row, col, { hasRedBorder: !hasRedBorder });
	};

	const handleToggleBlackBorder = (
		row: number,
		col: number,
		side: "top" | "right" | "bottom" | "left",
	) => {
		const cell = grid.cells[row][col];
		const currentBorders = cell.customization?.blackBorders ?? {};
		const newBorders = {
			...currentBorders,
			[side]: !currentBorders[side],
		};
		grid.customizeCell(row, col, { blackBorders: newBorders });
	};

	return (
		<>
			<style>
				{`
					@media print {
						.no-print {
							display: none !important;
						}
						${
							!printWithSolution
								? `
						.print-cell-value {
							display: none !important;
						}
						`
								: ""
						}
						.print-hide-empty {
							display: none !important;
						}
						.print-hide-grid {
							display: none !important;
						}
						.print-show-arrows {
							display: block !important;
						}
						@page {
							margin: 1cm;
						}
						body {
							print-color-adjust: exact;
							-webkit-print-color-adjust: exact;
						}
					}
				`}
			</style>
			<DndContext
				sensors={sensors}
				collisionDetection={topLeftCornerCollision}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				modifiers={[snapToGridModifier]}
			>
				<div
					className="flex flex-col lg:flex-row gap-4 p-4 h-full overflow-hidden"
					onClick={handleBackgroundClick}
				>
					<details
						open
						className="no-print shrink-0 lg:[&[open]]:w-80 flex flex-col min-h-0 max-h-full overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						<summary className="cursor-pointer list-none mb-4 shrink-0">
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg">
								<span className="details-marker">▶</span>
								<span>Control Panel</span>
							</div>
						</summary>
						<div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0">
							<ControlPanel
								direction={direction}
								onDirectionChange={setDirection}
								inputText={inputText}
								onInputTextChange={setInputText}
								onPlaceWord={handlePlaceWord}
								selectedCell={grid.selectedCell}
								words={wordManager.words}
								selectedWordId={wordManager.selectedWord}
								onSelectWord={wordManager.setSelectedWord}
								onDeleteWord={handleDeleteWord}
								onMoveWordUp={wordManager.moveWordUp}
								onMoveWordDown={wordManager.moveWordDown}
								onGenerateStepImages={handleGenerateStepImages}
								onGenerateHighlightImages={handleGenerateHighlightImages}
							/>
						</div>
					</details>

					<div className="flex-1 min-w-0 min-h-0 overflow-auto">
						<GridDisplay
							rows={grid.rows}
							cols={grid.cols}
							cells={grid.cells}
							selectedCell={grid.selectedCell}
							onCellClick={grid.handleCellClick}
							draggingWordId={draggingWordId}
							onCellContextMenu={(row, col, e) =>
								handleCellContextMenu(row, col, e)
							}
							words={wordManager.words}
							selectedWordId={wordManager.selectedWord}
							onSelectWord={(wordId) => {
								// Toggle selection: if already selected, deselect it
								if (wordManager.selectedWord === wordId) {
									wordManager.setSelectedWord(null);
								} else {
									wordManager.setSelectedWord(wordId);
								}
							}}
							onAddBend={wordManager.addBend}
							onRemoveBend={wordManager.removeBend}
						/>
					</div>

					{customizationMenu && (
						<CellCustomizationMenu
							cell={grid.cells[customizationMenu.row][customizationMenu.col]}
							position={{ x: customizationMenu.x, y: customizationMenu.y }}
							onMakeBlack={() =>
								handleMakeBlack(customizationMenu.row, customizationMenu.col)
							}
							onToggleRedBorder={() =>
								handleToggleRedBorder(
									customizationMenu.row,
									customizationMenu.col,
								)
							}
							onToggleBlackBorder={(side) =>
								handleToggleBlackBorder(
									customizationMenu.row,
									customizationMenu.col,
									side,
								)
							}
							onClose={() => setCustomizationMenu(null)}
						/>
					)}
				</div>
			</DndContext>
		</>
	);
}

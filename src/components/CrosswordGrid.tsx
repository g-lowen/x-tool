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
import { generateStepImages } from "./crossword/step-image-generator";
import type { CrosswordGridProps, Direction } from "./crossword/types";
import { useCrosswordGrid } from "./crossword/use-crossword-grid";
import { useCrosswordWords } from "./crossword/use-crossword-words";
import {
	calculateGridPosition,
	createSnapToGridModifier,
	createTopLeftCornerCollision,
} from "./crossword/utils";

export function CrosswordGrid({
	initialRows = 15,
	initialCols = 15,
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

	const _handlePrint = () => {
		window.print();
	};

	const handlePrintBlank = () => {
		setPrintWithSolution(false);
		setTimeout(() => window.print(), 0);
	};

	const handlePrintSolution = () => {
		setPrintWithSolution(true);
		setTimeout(() => window.print(), 0);
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
				<div className="flex gap-8 p-8" onClick={handleBackgroundClick}>
					<div className="no-print fixed top-4 right-4 flex gap-2 z-50">
						<button
							type="button"
							onClick={handlePrintBlank}
							className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-lg"
						>
							🖨️ Print Blank Puzzle
						</button>
						<button
							type="button"
							onClick={handlePrintSolution}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg"
						>
							✓ Print Solution
						</button>
					</div>

					<div className="no-print" onClick={(e) => e.stopPropagation()}>
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
						/>
					</div>

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
							onClose={() => setCustomizationMenu(null)}
						/>
					)}
				</div>
			</DndContext>
		</>
	);
}

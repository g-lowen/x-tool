import {
	DndContext,
	type DragEndEvent,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { GRID_TOTAL_CELL_SIZE } from "./crossword/constants";
import { ControlPanel } from "./crossword/control-panel";
import { GridDisplay } from "./crossword/grid-display";
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

				// Clamp position to prevent overflow
				const maxCol =
					word.direction === "horizontal"
						? grid.cols - word.text.length
						: grid.cols - 1;
				const maxRow =
					word.direction === "vertical"
						? grid.rows - word.text.length
						: grid.rows - 1;

				const clampedRow = Math.max(0, Math.min(maxRow, dropRow));
				const clampedCol = Math.max(0, Math.min(maxCol, dropCol));

				wordManager.moveWord(wordId, clampedRow, clampedCol);
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

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={topLeftCornerCollision}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			modifiers={[snapToGridModifier]}
		>
			<div className="flex gap-8 p-8">
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
				/>

				<GridDisplay
					rows={grid.rows}
					cols={grid.cols}
					cells={grid.cells}
					selectedCell={grid.selectedCell}
					onCellClick={grid.handleCellClick}
					draggingWordId={draggingWordId}
					onCellContextMenu={grid.makeBlackCell}
					words={wordManager.words}
					selectedWordId={wordManager.selectedWord}
					onSelectWord={wordManager.setSelectedWord}
					onDeleteWord={handleDeleteWord}
				/>
			</div>
		</DndContext>
	);
}

import { DirectionSelector } from "./direction-selector";
import type { Direction, Word } from "./types";
import { WordInput } from "./word-input";
import { WordList } from "./word-list";

interface ControlPanelProps {
	direction: Direction;
	onDirectionChange: (direction: Direction) => void;
	inputText: string;
	onInputTextChange: (text: string) => void;
	onPlaceWord: () => void;
	selectedCell: { row: number; col: number } | null;
	words: Word[];
	selectedWordId: string | null;
	onSelectWord: (wordId: string | null) => void;
	onDeleteWord: (wordId: string) => void;
	onMoveWordUp: (wordId: string) => void;
	onMoveWordDown: (wordId: string) => void;
}

export function ControlPanel({
	direction,
	onDirectionChange,
	inputText,
	onInputTextChange,
	onPlaceWord,
	selectedCell,
	words,
	selectedWordId,
	onSelectWord,
	onDeleteWord,
	onMoveWordUp,
	onMoveWordDown,
}: ControlPanelProps) {
	return (
		<div className="flex flex-col gap-4 w-80">
			<div className="bg-white p-4 rounded-lg shadow">
				<h2 className="font-bold text-lg mb-3">Add Word</h2>
				<div className="space-y-3">
					<DirectionSelector
						direction={direction}
						onDirectionChange={onDirectionChange}
					/>
					<WordInput
						value={inputText}
						onChange={onInputTextChange}
						onSubmit={onPlaceWord}
						disabled={!selectedCell || !inputText.trim()}
					/>
					{selectedCell && (
						<div className="text-sm text-gray-600">
							Selected: Row {selectedCell.row + 1}, Column{" "}
							{selectedCell.col + 1}
						</div>
					)}
				</div>
			</div>

			<WordList
				words={words}
				selectedWordId={selectedWordId}
				onSelectWord={onSelectWord}
				onDeleteWord={onDeleteWord}
				onMoveWordUp={onMoveWordUp}
				onMoveWordDown={onMoveWordDown}
			/>

			<div className="text-sm text-gray-600">
				<p className="font-medium mb-1">Instructions:</p>
				<ul className="list-disc list-inside space-y-1">
					<li>Click a cell to select start position</li>
					<li>Choose direction (→ or ↓)</li>
					<li>Type word and press Enter or click Place</li>
					<li>Drag words to move them</li>
					<li>Click word then × button to delete</li>
					<li>Right-click cell to make it black</li>
				</ul>
			</div>
		</div>
	);
}

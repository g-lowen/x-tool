import type { Word } from "./types";

interface WordListProps {
	words: Word[];
	selectedWordId: string | null;
	onSelectWord: (wordId: string) => void;
}

export function WordList({
	words,
	selectedWordId,
	onSelectWord,
}: WordListProps) {
	return (
		<div className="bg-white p-4 rounded-lg shadow">
			<h2 className="font-bold text-lg mb-3">Words ({words.length})</h2>
			<div className="space-y-2 max-h-60 overflow-y-auto">
				{words.map((word) => (
					<div
						key={word.id}
						onClick={() => onSelectWord(word.id)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								onSelectWord(word.id);
							}
						}}
						role="button"
						tabIndex={0}
						className={`p-2 border rounded cursor-pointer ${
							selectedWordId === word.id
								? "bg-blue-100 border-blue-500"
								: "bg-white hover:bg-gray-50"
						}`}
					>
						<div className="font-medium">{word.text}</div>
						<div className="text-xs text-gray-500">
							{word.direction === "horizontal" ? "→" : "↓"} ({word.row + 1},
							{word.col + 1})
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

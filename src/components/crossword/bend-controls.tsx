import type { Direction, Word } from "./types";

interface BendControlsProps {
	word: Word;
	onAddBend: (letterIndex: number, direction: Direction) => void;
	onRemoveBend: (letterIndex: number) => void;
}

export function BendControls({
	word,
	onAddBend,
	onRemoveBend,
}: BendControlsProps) {
	return (
		<div className="bg-white p-4 rounded-lg shadow">
			<h3 className="font-bold text-md mb-2">Bend Word: {word.text}</h3>
			<p className="text-sm text-gray-600 mb-3">
				Click a letter to bend the word at that position
			</p>

			<div className="space-y-2">
				{word.text.split("").map((char, index) => {
					const hasBend = word.bends?.some((b) => b.index === index);
					const bendAtNext = word.bends?.find((b) => b.index === index + 1);

					return (
						<div
							key={index}
							className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
						>
							<div className="w-8 h-8 flex items-center justify-center font-bold border-2 border-gray-400 bg-white">
								{char === " " ? "□" : char}
							</div>
							<div className="flex-1 text-sm">
								Position {index + 1}
								{bendAtNext && (
									<span className="text-blue-600 ml-2">
										→ Bends {bendAtNext.direction}
									</span>
								)}
							</div>

							{index < word.text.length - 1 && !hasBend && (
								<div className="flex gap-1">
									<button
										type="button"
										onClick={() => onAddBend(index + 1, "horizontal")}
										className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
										title="Bend horizontal after this letter"
									>
										→
									</button>
									<button
										type="button"
										onClick={() => onAddBend(index + 1, "vertical")}
										className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
										title="Bend vertical after this letter"
									>
										↓
									</button>
								</div>
							)}

							{bendAtNext && (
								<button
									type="button"
									onClick={() => onRemoveBend(index + 1)}
									className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
								>
									Remove Bend
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

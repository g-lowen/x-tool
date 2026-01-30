import type { Direction } from "./types";

interface DirectionSelectorProps {
	direction: Direction;
	onDirectionChange: (direction: Direction) => void;
}

export function DirectionSelector({
	direction,
	onDirectionChange,
}: DirectionSelectorProps) {
	return (
		<div>
			<label htmlFor="direction" className="block text-sm font-medium mb-1">
				Direction
			</label>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => onDirectionChange("horizontal")}
					className={`flex-1 px-3 py-2 rounded ${
						direction === "horizontal"
							? "bg-blue-500 text-white"
							: "bg-gray-200"
					}`}
				>
					Horizontal →
				</button>
				<button
					type="button"
					onClick={() => onDirectionChange("vertical")}
					className={`flex-1 px-3 py-2 rounded ${
						direction === "vertical" ? "bg-blue-500 text-white" : "bg-gray-200"
					}`}
				>
					Vertical ↓
				</button>
			</div>
		</div>
	);
}

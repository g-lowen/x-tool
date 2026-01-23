import { useDroppable } from "@dnd-kit/core";
import type { Cell } from "./types";

interface GridCellProps {
	rowIndex: number;
	colIndex: number;
	cell: Cell;
	isSelected: boolean;
	isDragging?: boolean;
	onClick: () => void;
	onContextMenu: (e: React.MouseEvent) => void;
}

export function GridCell({
	rowIndex,
	colIndex,
	cell,
	isSelected,
	isDragging = false,
	onClick,
	onContextMenu,
}: GridCellProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `${rowIndex}-${colIndex}`,
	});

	return (
		<div
			ref={setNodeRef}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onClick();
				}
			}}
			onContextMenu={onContextMenu}
			role="button"
			tabIndex={0}
			className={`w-10 h-10 flex items-center justify-center font-bold text-lg uppercase cursor-pointer select-none ${
				isDragging
					? "bg-white"
					: cell.isBlack
						? "bg-black"
						: isSelected
							? "bg-blue-200 ring-2 ring-blue-500"
							: isOver
								? "bg-green-100"
								: "bg-white hover:bg-gray-100"
			}`}
		>
			{!isDragging && !cell.isBlack && !cell.wordId && cell.value}
		</div>
	);
}

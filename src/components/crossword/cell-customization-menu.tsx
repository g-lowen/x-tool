import type { Cell } from "./types";

interface CellCustomizationMenuProps {
	cell: Cell;
	position: { x: number; y: number };
	onMakeBlack: () => void;
	onToggleRedBorder: () => void;
	onClose: () => void;
}

export function CellCustomizationMenu({
	cell,
	position,
	onMakeBlack,
	onToggleRedBorder,
	onClose,
}: CellCustomizationMenuProps) {
	const hasRedBorder = cell.customization?.hasRedBorder ?? false;

	return (
		<>
			{/* Backdrop to detect clicks outside */}
			<div
				className="fixed inset-0 z-40"
				onClick={onClose}
				onContextMenu={(e) => {
					e.preventDefault();
					onClose();
				}}
			/>

			{/* Menu */}
			<div
				className="fixed z-50 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-2 min-w-[200px]"
				style={{
					left: `${position.x}px`,
					top: `${position.y}px`,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="font-bold text-sm mb-2 px-2 py-1 border-b">
					Customize Cell
				</div>

				<button
					type="button"
					onClick={() => {
						onMakeBlack();
						onClose();
					}}
					className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
				>
					<span className="w-5 h-5 bg-black border border-gray-400" />
					{cell.isBlack ? "Make White" : "Make Black"}
				</button>

				<button
					type="button"
					onClick={() => {
						onToggleRedBorder();
						onClose();
					}}
					className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
				>
					<span className="w-5 h-5 bg-white border-4 border-red-500" />
					{hasRedBorder ? "Remove Red Border" : "Add Red Border"}
				</button>
			</div>
		</>
	);
}

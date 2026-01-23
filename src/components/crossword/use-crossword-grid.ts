import { useState } from "react";
import type { Cell } from "./types";

export function useCrosswordGrid(initialRows: number, initialCols: number) {
	const [rows, setRows] = useState(initialRows);
	const [cols, setCols] = useState(initialCols);
	const [cells, setCells] = useState<Cell[][]>(() =>
		Array.from({ length: initialRows }, () =>
			Array.from({ length: initialCols }, () => ({
				value: "",
				isBlack: false,
			})),
		),
	);
	const [selectedCell, setSelectedCell] = useState<{
		row: number;
		col: number;
	} | null>(null);

	const updateCell = (
		rowIndex: number,
		colIndex: number,
		value: string,
		isBlack?: boolean,
	) => {
		setCells((prev) => {
			const newCells = prev.map((row) => row.map((cell) => ({ ...cell })));
			if (isBlack !== undefined) {
				newCells[rowIndex][colIndex].isBlack = isBlack;
			}
			newCells[rowIndex][colIndex].value = value.toUpperCase();
			return newCells;
		});
	};

	const handleCellClick = (rowIndex: number, colIndex: number) => {
		if (cells[rowIndex][colIndex].isBlack) {
			updateCell(rowIndex, colIndex, "", false);
		} else {
			setSelectedCell({ row: rowIndex, col: colIndex });
		}
	};

	const makeBlackCell = (rowIndex: number, colIndex: number) => {
		updateCell(rowIndex, colIndex, "", true);
		if (
			selectedCell &&
			selectedCell.row === rowIndex &&
			selectedCell.col === colIndex
		) {
			setSelectedCell(null);
		}
	};

	return {
		rows,
		cols,
		cells,
		selectedCell,
		setSelectedCell,
		setCells,
		handleCellClick,
		makeBlackCell,
	};
}

interface WordInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	disabled?: boolean;
}

export function WordInput({
	value,
	onChange,
	onSubmit,
	disabled = false,
}: WordInputProps) {
	return (
		<div>
			<label htmlFor="wordInput" className="block text-sm font-medium mb-1">
				Word/Phrase
			</label>
			<input
				id="wordInput"
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !disabled) {
						onSubmit();
					}
				}}
				placeholder="e.g. Pink Floyd"
				className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<button
				type="button"
				onClick={onSubmit}
				disabled={disabled}
				className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
			>
				Place Word
			</button>
		</div>
	);
}

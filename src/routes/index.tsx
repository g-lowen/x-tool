import { createFileRoute } from "@tanstack/react-router";
import { CrosswordGrid } from "../components/CrosswordGrid";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
			<CrosswordGrid />
		</div>
	);
}

import { createFileRoute } from "@tanstack/react-router";
import { CrosswordGrid } from "../components/CrosswordGrid";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto py-8">
				<h1 className="text-3xl font-bold text-center mb-8">X-Gen</h1>
				<CrosswordGrid />
			</div>
		</div>
	);
}

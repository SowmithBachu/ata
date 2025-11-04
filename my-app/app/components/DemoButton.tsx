"use client";

export default function DemoButton() {
	function handleDemo() {
		// eslint-disable-next-line no-console
		console.log("Starting demo session...");
	}

	return (
		<button
			onClick={handleDemo}
			className="rounded-md border border-neutral-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
		>
			Try Demo
		</button>
	);
}



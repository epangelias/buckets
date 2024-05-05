import { Head } from '$fresh/runtime.ts';

export default function Error404() {
	return (
		<>
			<Head>
				<title>Page not found</title>
			</Head>
			<main>
				<h1>Page not found</h1>
				<a href='/'>Go back home</a>
			</main>
		</>
	);
}

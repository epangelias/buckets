import { type PageProps } from '$fresh/server.ts';
import * as gfm from 'https://deno.land/x/gfm@0.6.0/mod.ts';

export default function App({ Component }: PageProps) {
	return (
		<html>
			<head>
				<meta charset='utf-8' />
				<meta name='color-scheme' content='light dark' />
				<title>Hash Buckets</title>
				<link rel='stylesheet' href='/styles.css' />
				<link
					rel='icon'
					href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪣</text></svg>`}
				>
				</link>
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta name='msapplication-tap-highlight' content='no' />
				<link
					rel='apple-touch-icon'
					href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪣</text></svg>'
				/>
				<meta content='minimum-scale=1.0, width=device-width, maximum-scale=1, user-scalable=no' name='viewport' />
				<style>{gfm.CSS}</style>
			</head>
			<body>
				<Component />
			</body>
		</html>
	);
}

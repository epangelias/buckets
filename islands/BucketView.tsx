import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { decryptText, encryptText } from '../helpers/crypto.ts';
import * as gfm from 'https://deno.land/x/gfm@0.6.0/mod.ts';

export default function BucketView({ text, passkey, edit }: { text: string; passkey: string | null; edit: boolean }) {
	const html = useSignal('');

	async function render() {
		let res = text;
		try {
			res = await decryptText(text, passkey || '');
		} catch (e) {
			// res = text;
		}
		html.value = gfm.render(res);
	}

	const lightDark = globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;

	useEffect(() => {
		render();
		document.documentElement.classList.add('markdown-body');
		document.documentElement.setAttribute('data-color-mode', lightDark ? 'dark' : 'light');
		document.documentElement.setAttribute('data-light-theme', 'light');
		document.documentElement.setAttribute('data-dark-theme', 'dark');
		document.documentElement.style.backgroundColor = 'var(--color-canvas-default)';
	}, []);

	return (
		<main style={{ paddingTop: '2rem' }}>
			{edit &&
				(
					<a
						href={'/?hash=' + globalThis?.location?.pathname.split('/').slice(1).join('/') + (passkey ? '&key=' + passkey : '')}
						style={{ float: 'right' }}
					>
						Edit
					</a>
				)}
			<div dangerouslySetInnerHTML={{ __html: html.value }}></div>
		</main>
	);
}

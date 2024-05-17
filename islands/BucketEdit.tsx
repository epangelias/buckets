import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { decryptText, encryptText } from '../helpers/crypto.ts';
import { qrcode } from '@libs/qrcode';

export default function BucketEdit({ text, passkey }: { text: string; passkey: string | null }) {
	const formRef = useRef<HTMLFormElement>(null);

	const textData = useSignal(text);
	const keyData = useSignal(passkey || '');
	const hash = useSignal('');

	function getFormData() {
		if (!formRef.current) return;
		const formData = new FormData(formRef.current);
		const text = formData.get('text') as string;
		const key = formData.get('key') as string;
		textData.value = text;
		keyData.value = key;
		return { text, key };
	}

	async function decrypt() {
		getFormData();
		textData.value = await decryptText(textData.value, keyData.value);
	}

	async function save() {
		getFormData();

		const text = keyData.value ? await encryptText(textData.value, keyData.value) : textData.value;

		const res = await fetch('/save', {
			method: 'POST',
			body: text,
		});
		if (!res.ok) return alert('Server Error');
		hash.value = await res.text();

		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('hash', hash.value);
		if (keyData.value) searchParams.set('key', keyData.value);
		else searchParams.delete('key');
		const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
		window.history.pushState(null, '', newRelativePathQuery + window.location.hash);
	}

	useEffect(() => {
		if (passkey !== null) decrypt();
	}, []);

	async function view(e: MouseEvent) {
		e.preventDefault();
		await save();
		window.location.replace((e.target as HTMLAnchorElement).href);
	}

	const viewURL = '/' + hash.value + (keyData.value ? '?key=' + keyData.value + '&edit=1' : '?edit=1');
	const pubURL = globalThis?.location?.origin + '/' + hash.value + (keyData.value ? '?key=' + keyData.value : '');
	const pubURLShort = globalThis?.location?.host + '/' + hash.value + (keyData.value ? '?key=' + keyData.value : '');

	return (
		<form ref={formRef} onSubmit={(e) => e.preventDefault()}>
			<p>
			</p>

			<div>
				<input type='text' name='key' value={keyData.value} autocomplete='off' placeholder='Key' />
				<button type='button' onClick={save}>Save</button>
				<a
					onClick={view}
					href={viewURL}
					target='_blank'
					style={{ float: 'right' }}
				>
					View
				</a>
				<br />
				<br />
			</div>

			<textarea
				name='text'
				placeholder='Bucket Text'
				value={textData.value}
				autoComplete='off'
			>
			</textarea>

			{hash.value && (
				<div class='qr-code'>
					<a href={pubURL} target='_blank'>
						<div dangerouslySetInnerHTML={{ __html: qrcode(pubURL, { output: 'svg' }) }}></div>
						<p>{pubURLShort}</p>
					</a>
				</div>
			)}
		</form>
	);
}

import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { decryptText, encryptText } from '../helpers/crypto.ts';

export default function BucketEdit({ text, passkey }: { text: string; passkey: string | null }) {
	const formRef = useRef<HTMLFormElement>(null);

	const textData = useSignal(text);
	const keyData = useSignal(passkey || '');
	const includeKey = useSignal(false);

	const hash = useSignal('');

	function getFormData() {
		if (!formRef.current) return;
		const formData = new FormData(formRef.current);
		const text = formData.get('text') as string;
		const key = formData.get('key') as string;
		const includeKeyOpt = !!formData.get('include-key');
		textData.value = text;
		keyData.value = key;
		includeKey.value = includeKeyOpt;
		return { text, key };
	}

	async function encrypt() {
		getFormData();
		textData.value = await encryptText(textData.value, keyData.value);
	}

	async function decrypt() {
		getFormData();
		textData.value = await decryptText(textData.value, keyData.value);
	}

	async function save() {
		getFormData();

		const res = await fetch('/save', {
			method: 'POST',
			body: textData.value,
		});
		if (!res.ok) return alert('Server Error');
		hash.value = await res.text();

		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('hash', hash.value);
		if (includeKey.value) searchParams.set('key', keyData.value);
		else searchParams.delete('key');
		const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
		window.history.pushState(null, '', newRelativePathQuery + window.location.hash);
	}

	useEffect(() => {
		if (passkey !== null) {
			includeKey.value = true;
			decrypt();
		}
	}, []);

	async function view(e: MouseEvent) {
		e.preventDefault();
		await save();
		window.location.replace((e.target as HTMLAnchorElement).href);
	}

	return (
		<form ref={formRef} onSubmit={(e) => e.preventDefault()}>
			<p>
			</p>

			<div>
				<input type='text' name='key' value={keyData.value} autocomplete='off' placeholder='Key' />
				<button type='button' onClick={encrypt}>Encrypt</button>
				<button type='button' onClick={decrypt}>Decrypt</button>
				<button type='button' onClick={save}>Save</button>
				<input type='checkbox' name='include-key' id='include-key' checked={includeKey} />
				<label htmlFor='include-key'>Include Key</label>
				<a onClick={view} href={'/' + hash.value + '?key=' + keyData.value} target='_blank' style={{ float: 'right' }}>View</a>
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
		</form>
	);
}

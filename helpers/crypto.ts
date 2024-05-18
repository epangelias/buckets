// crypto.ts

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getKeyMaterial = async (password: string): Promise<CryptoKey> => {
	const pwUtf8 = encoder.encode(password);
	return await crypto.subtle.importKey(
		'raw',
		pwUtf8,
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey'],
	);
};

const getKey = async (keyMaterial: CryptoKey, salt: Uint8Array, keyUsage: KeyUsage[]): Promise<CryptoKey> => {
	return await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256',
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		true,
		keyUsage,
	);
};

export const encryptText = async (text: string, password: string): Promise<string> => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const keyMaterial = await getKeyMaterial(password);
	const key = await getKey(keyMaterial, salt, ['encrypt']);

	const ptUtf8 = encoder.encode(text);
	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv,
		},
		key,
		ptUtf8,
	);

	const ctArray = Array.from(new Uint8Array(encrypted));
	const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join('');
	const ctBase64 = btoa(ctStr);
	const ivHex = Array.from(iv).map((b) => ('00' + b.toString(16)).slice(-2)).join('');
	const saltHex = Array.from(salt).map((b) => ('00' + b.toString(16)).slice(-2)).join('');

	return `${ctBase64}.${ivHex}.${saltHex}`;
};

export const decryptText = async (encryptedText: string, password: string): Promise<string> => {
	const [ctBase64, ivHex, saltHex] = encryptedText.split('.');

	const ctStr = atob(ctBase64);
	const ctUint8Array = new Uint8Array(ctStr.match(/[\s\S]/g)!.map((ch) => ch.charCodeAt(0)));

	const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
	const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));

	const keyMaterial = await getKeyMaterial(password);
	const key = await getKey(keyMaterial, salt, ['decrypt']);

	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: iv,
		},
		key,
		ctUint8Array,
	);

	return decoder.decode(decrypted);
};

export const hashText = async (text: string, length: number = 8): Promise<string> => {
	const data = new TextEncoder().encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // base 62 characters
	const hashHex = hashArray.slice(0, length).map((b) => characters[b % characters.length]).join('');
	return hashHex.toUpperCase(); // Reverts case
};

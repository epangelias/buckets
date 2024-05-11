import BucketView from '../islands/BucketView.tsx';
import { FreshContext } from '$fresh/server.ts';
import { decryptText } from '../helpers/crypto.ts';

const db = await Deno.openKv();

export default async function Home(req: Request, ctx: FreshContext) {
	let text = '';

	const hash = ctx.params.hash || ctx.url.searchParams.get('hash');
	const key = ctx.url.searchParams.get('key');
	const raw = !!ctx.url.searchParams.get('raw');

	if (hash) {
		const res = await db.get(['blob', hash]);
		if (res.versionstamp !== null) text = res.value as string;
	}

	if (raw) {
		if (key) return new Response(await decryptText(text, key));
		else return new Response(text);
	}

	return (
		<main>
			<BucketView text={text} passkey={key} />
		</main>
	);
}

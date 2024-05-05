import BucketEdit from '../islands/BucketEdit.tsx';
import { FreshContext } from '$fresh/server.ts';

const db = await Deno.openKv();

export default async function Home(req: Request, ctx: FreshContext) {
	let text = '';

	const hash = ctx.url.searchParams.get('hash');
	const key = ctx.url.searchParams.get('key');

	if (hash) {
		const res = await db.get(['blob', hash]);
		if (res.versionstamp !== null) text = res.value as string;
	}

	return (
		<main>
			<h1>🪣 Hash Buckets</h1>
			<BucketEdit text={text} passkey={key} />
		</main>
	);
}

import { hashText } from '../helpers/crypto.ts';

const db = await Deno.openKv();

export const handler = {
	POST: async (req: Request) => {
		const text = await req.text();
		const hash = await hashText(text, 2);
		await db.set(['blob', hash], text);
		return new Response(hash);
	},
};

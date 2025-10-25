// @ts-nocheck
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Load fonts
const interRegular = await Bun.file('./fonts/Inter-Regular.ttf').arrayBuffer();
const interBold = await Bun.file('./fonts/Inter-Bold.ttf').arrayBuffer();

const server = Bun.serve({
	port: process.env.PORT || 3000,
	async fetch(req) {
		const url = new URL(req.url);
	
		const header = url.searchParams.get('header') || '';
		const value = url.searchParams.get('value') || '';
		const projectName = url.searchParams.get('projectName') || '';
		const projectUrl = url.searchParams.get('projectUrl') || '';
		
		const svg = await satori(
			{type: 'div', props: {children: 'hello world'}},
			{
			  width: 1200,
			  height: 630,
			  embedFont: true,
			  fonts: [
				{
				  name: 'Inter',
				  data: interRegular,
				  weight: 400,
				  style: 'normal',
				},
				{
				  name: 'Inter',
				  data: interBold,
				  weight: 700,
				  style: 'normal',
				},
			  ],
			}
		  )
		
	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: 4800, // 4x resolution for crisp high-DPI displays (1200 * 4)
		},
	});
	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

		return new Response(pngBuffer, {
			headers: {
				'Content-Type': 'image/png',
			},
		});
	},
});

console.log(`Listening on ${server.url}`);
// @ts-nocheck
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Load fonts
const interRegular = await Bun.file('/Users/mint/p/og-cards-v2/fonts/Inter-Regular.ttf').arrayBuffer();
const interBold = await Bun.file('/Users/mint/p/og-cards-v2/fonts/Inter-Bold.ttf').arrayBuffer();

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url);
		
		// Extract query parameters
		const header = url.searchParams.get('header') || '';
		const value = url.searchParams.get('value') || '';
		const projectName = url.searchParams.get('projectName') || '';
		const projectUrl = url.searchParams.get('projectUrl') || '';
		
		// Create a simple red card template (1200x630) using Satori's object notation
		
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
		
		// Convert SVG to PNG using @resvg/resvg-js
		const resvg = new Resvg(svg, {
			fitTo: {
				mode: 'width',
				value: 1200,
			},
		});
		const pngData = resvg.render();
		const pngBuffer = pngData.asPng();
		
		// Return PNG response with proper headers
		return new Response(pngBuffer, {
			headers: {
				'Content-Type': 'image/png',
			},
		});
	},
});

console.log(`Listening on ${server.url}`);


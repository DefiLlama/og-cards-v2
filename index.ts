// @ts-nocheck
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

// Load fonts
const interRegular = await Bun.file("./fonts/Inter-Regular.ttf").arrayBuffer();
const interBold = await Bun.file("./fonts/Inter-Bold.ttf").arrayBuffer();

const fonts = [
  {
    name: "Inter",
    data: interRegular,
    weight: 400,
    style: "normal",
  },
  {
    name: "Inter",
    data: interBold,
    weight: 700,
    style: "normal",
  },
];

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const url = new URL(req.url);

    const header = url.searchParams.get("header") || "";
    const value = url.searchParams.get("value") || "";
    const projectName = url.searchParams.get("projectName") || "";
    const projectUrl = url.searchParams.get("projectUrl") || "";

    const svg = await satori(
      {
        type: "div",
        props: {
          children: { type: "p", props: { children: "hello world!" } },
          style: {
            width: "100%",
            height: "100%",
            backgroundColor: "cyan",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter",
            fontSize: "24px",
            fontWeight: "bold",
          },
        },
      },
      {
        width: 1200,
        height: 630,
        fonts,
      }
    );

    const finalImage = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(finalImage, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  },
});

console.log(`Listening on ${server.url}`);

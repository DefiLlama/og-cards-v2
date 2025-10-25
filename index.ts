// @ts-nocheck
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { sanitizeUrl, sanitizeText, sanitizeImageUrl } from "./utils/sanitize";

// Load fonts
const interRegular = await Bun.file("./fonts/Inter-Regular.ttf").arrayBuffer();
const interBold = await Bun.file("./fonts/Inter-Bold.ttf").arrayBuffer();

// Load SVG logo and convert to data URL
const defillamaSvgDarkBuffer = await Bun.file("./logo/defillama-dark.svg").arrayBuffer();
const defillamaSvgLightBuffer = await Bun.file("./logo/defillama-light.svg").arrayBuffer();
const defillamaSvgBase64Dark = Buffer.from(defillamaSvgDarkBuffer).toString("base64");
const defillamaSvgBase64Light = Buffer.from(defillamaSvgLightBuffer).toString("base64");
const defillamaLogoDataUrlDark = `data:image/svg+xml;base64,${defillamaSvgBase64Dark}`;
const defillamaLogoDataUrlLight = `data:image/svg+xml;base64,${defillamaSvgBase64Light}`;

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
    try {
      // Only allow GET requests
      if (req.method !== "GET") {
        return new Response("Method not allowed", {
          status: 405,
        });
      }

      const url = new URL(req.url);

      // Sanitize text inputs with length limits
      const header = sanitizeText(url.searchParams.get("header"), 100);
      const value = sanitizeText(url.searchParams.get("value"), 100);
      const projectName = sanitizeText(
        url.searchParams.get("projectName"),
        100
      );
      const theme =
        url.searchParams.get("theme") === "light" ? "light" : "dark";

      // Sanitize URL inputs
      const projectLogo = sanitizeImageUrl(url.searchParams.get("projectLogo"));
      const footerUrl = sanitizeUrl(
        url.searchParams.get("footerUrl") || "https://defillama.com"
      );

      const svg = await satori(
        {
          type: "div",
          props: {
            children: [
              {
                type: "div",
                props: {
                  children: { type: "img", props: { src: theme === "dark" ? defillamaLogoDataUrlLight : defillamaLogoDataUrlDark, height: 120 }, style: { objectFit: "contain" } },
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
					flex: 1,
                  },
                },
              },
              {
                type: "div",
                props: {
                  children: `DefiLlama is committed to providing accurate data without advertisements or sponsored content, as well as transparency. Learn more on : ${footerUrl}`,
                  style: {
                    textAlign: "center",
                    fontSize: "12px",
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                },
              },
            ],
            style: {
              width: "100%",
              height: "100%",
              backgroundColor: "cyan",
              display: "flex",
              flexDirection: "column",
              fontFamily: "Inter",
              padding: "48px",
              background: theme === "dark" ? "#262938" : "#FFFFFF",
              color: theme === "dark" ? "#FFFFFF" : "#000000",
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
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Content-Security-Policy": "default-src 'none'",
          // "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      // Don't expose internal error details
      console.error("Error generating image:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },
});

console.log(`Listening on ${server.url}`);

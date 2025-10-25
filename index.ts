// @ts-nocheck
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { sanitizeUrl, sanitizeText, sanitizeImageUrl } from "./utils/sanitize";

// Load fonts
const interRegular = await Bun.file("./fonts/Inter-Regular.ttf").arrayBuffer();
const interBold = await Bun.file("./fonts/Inter-Bold.ttf").arrayBuffer();

// Load SVG logo and convert to data URL
const llamaIconBuffer = await Bun.file("./logo/llama-icon.svg").arrayBuffer();
const llamaIconBase64 = Buffer.from(llamaIconBuffer).toString("base64");
const llamaIconDataUrl = `data:image/svg+xml;base64,${llamaIconBase64}`;

const llamaNameWhiteBuffer = await Bun.file(
  "./logo/llama-name-white.svg"
).arrayBuffer();
const llamaNameWhiteBase64 =
  Buffer.from(llamaNameWhiteBuffer).toString("base64");
const llamaNameWhiteDataUrl = `data:image/svg+xml;base64,${llamaNameWhiteBase64}`;

const llamaNameBlackBuffer = await Bun.file(
  "./logo/llama-name-black.svg"
).arrayBuffer();
const llamaNameBlackBase64 =
  Buffer.from(llamaNameBlackBuffer).toString("base64");
const llamaNameBlackDataUrl = `data:image/svg+xml;base64,${llamaNameBlackBase64}`;

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
      const metricName = sanitizeText(url.searchParams.get("metricName"), 100);
      const metricValue = sanitizeText(
        url.searchParams.get("metricValue"),
        100
      );
      const theme =
        url.searchParams.get("theme") === "light" ? "light" : "dark";

      // Sanitize URL inputs
      const projectLogo = sanitizeImageUrl(url.searchParams.get("projectLogo"));
      const footerUrl = sanitizeUrl(
        url.searchParams.get("footerUrl") || "https://defillama.com"
      );

      // Fetch and convert project logo to PNG
      let projectLogoDataUrl = null;

      if (projectLogo) {
        try {
          const response = await fetch(projectLogo);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            // Convert to PNG using sharp
            const pngBuffer = await sharp(Buffer.from(arrayBuffer))
              .resize(100, 100, {
                fit: "contain",
                background: { r: 0, g: 0, b: 0, alpha: 0 },
              })
              .png()
              .toBuffer();
            const base64 = pngBuffer.toString("base64");
            projectLogoDataUrl = `data:image/png;base64,${base64}`;
          }
        } catch (error) {
          console.error("Error fetching/converting project logo:", error);
        }
      }

      const content = [];

      if (projectName) {
        const projectAndLlama = [];
        if (projectLogoDataUrl) {
          // project logo and name on the left
          projectAndLlama.push({
            type: "div",
            props: {
              children: [
                {
                  type: "img",
                  props: {
                    src: projectLogoDataUrl,
                    height: 100,
                    width: 100,
                    style: {
                      borderRadius: "100%",
                      objectFit: "contain",
                    },
                  },
                },
                {
                  type: "div",
                  props: {
                    children: projectName,
                    style: {
                      fontSize: "48px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  },
                },
              ],
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexWrap: "nowrap",
                gap: "20px",
              },
            },
          });
        } else {
          // project name only on left
          projectAndLlama.push({
            type: "div",
            props: {
              children: projectName,
              style: {
                fontSize: "48px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            },
          });
        }

        // llama logo and name on the right
        projectAndLlama.push({
          type: "div",
          props: {
            children: [
              {
                type: "img",
                props: {
                  src: llamaIconDataUrl,
                  height: 100,
                },
              },
              {
                type: "img",
                props: {
                  src:
                    theme === "dark"
                      ? llamaNameWhiteDataUrl
                      : llamaNameBlackDataUrl,
                  height: 48,
                  width: 220,
                },
              },
            ],
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "20px",
              flex: 1,
            },
          },
        });

        // project on the left, llama on the right
        content.push({
          type: "div",
          props: {
            children: projectAndLlama,
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
              gap: "48px",
              flexWrap: "nowrap",
              overflow: "hidden",
            },
          },
        });
      } else {
        // llama in center of the image
        content.push({
          type: "div",
          props: {
            children: [
              {
                type: "img",
                props: {
                  src: llamaIconDataUrl,
                  height: 120,
                },
              },
              {
                type: "img",
                props: {
                  src:
                    theme === "dark"
                      ? llamaNameWhiteDataUrl
                      : llamaNameBlackDataUrl,
                  height: 48,
                  width: 220,
                },
              },
            ],
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              flex: 1,
            },
          },
        });
      }

      // footer text
      content.push({
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
      });

      const svg = await satori(
        {
          type: "div",
          props: {
            children: content,
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

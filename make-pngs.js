require("dotenv").config();

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const cliProgress = require("cli-progress");

// PNG settings
const PNG_DIMENSION = 2048;

(async () => {
  const flowersData = fs.readFileSync(
    path.join(process.cwd(), "./output/flowers.json")
  );
  const flowers = JSON.parse(flowersData);

  const allTokens = [];
  for (const [tokenId, token] of Object.entries(flowers)) {
    allTokens.push({
      tokenId,
      image: token.image,
    });
  }

  // Start browser to convert svg to png
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 0,
  });

  const page = await browser.newPage();
  await page.setViewport({
    height: PNG_DIMENSION,
    width: PNG_DIMENSION,
  });

  // Generate png files
  console.log("Rendering flower PNGs");

  const pngRenderProgress = new cliProgress.SingleBar();
  pngRenderProgress.start(allTokens.length, 0);

  for (const [index, token] of allTokens.entries()) {
    pngRenderProgress.update(index);

    // Get the raw SVG
    const svg = Buffer.from(token.image.substring(26), "base64").toString();

    // Render the SVG to the headless browser
    await page.setContent(
      `<!DOCTYPE html><style>* { margin: 0; padding: 0; }</style>${svg}`
    );

    // Save a screenshot to file
    await page.screenshot({
      path: path.join(process.cwd(), `image-files/pngs/${token.tokenId}.png`),
      clip: { width: PNG_DIMENSION, height: PNG_DIMENSION, x: 0, y: 0 },
    });
  }

  pngRenderProgress.stop();

  // Close the headless browser
  await browser.close();

  console.log("Saved all the flower PNGs into /image-files/png");
})().catch((err) => {
  console.error(err);
});

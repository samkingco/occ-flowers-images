require("dotenv").config();

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const GIFEncoder = require("gifencoder");
const PNG = require("png-js");
const cliProgress = require("cli-progress");

// GIF settings
const GIF_DIMENSION = 500;
const GIF_FPS = 25;
const GIF_DUR = 8;

const TOTAL_FRAMES = GIF_FPS * GIF_DUR;
const FRAME_TIME = (1 / GIF_FPS) * 1000;

function decode(png) {
  return new Promise((r) => {
    png.decode((pixels) => r(pixels));
  });
}

function lerp(input, output, progress) {
  return input + (output - input) * progress;
}

(async () => {
  // Load the data
  const flowersData = fs.readFileSync(
    path.join(process.cwd(), "./input/flowers.json")
  );
  const flowers = JSON.parse(flowersData);

  // Grab just the spinning tokens so we don't render gifs of non-spinners
  const spinners = [];
  for (const [tokenId, token] of Object.entries(flowers)) {
    if (token.attributes.spin) {
      spinners.push({
        tokenId,
        image: token.image,
      });
    }
  }

  // Start browser to convert svg to png
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 0,
  });

  const page = await browser.newPage();
  await page.setViewport({
    height: GIF_DIMENSION,
    width: GIF_DIMENSION,
  });

  // Generate gif files
  for (const token of spinners) {
    // Set logging things
    const renderProgress = new cliProgress.SingleBar();
    const encodeProgress = new cliProgress.SingleBar();

    // Set up a new gif encoder
    const encoder = new GIFEncoder(GIF_DIMENSION, GIF_DIMENSION);
    encoder
      .createWriteStream()
      .pipe(
        fs.createWriteStream(
          path.join(process.cwd(), `image-files/gifs/${token.tokenId}.gif`)
        )
      );

    // Start the encoder
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(FRAME_TIME);
    encoder.setQuality(10);

    // Grab the base64 data and parse out the SVG file
    let svg = Buffer.from(token.image.substring(26), "base64").toString();
    svg = svg.split('dur="8s"').join('dur="0s"');

    console.log(`Rendering frames for flower #${token.tokenId}`);
    renderProgress.start(TOTAL_FRAMES, 0);

    // Grab a screenshot of each frame for gif encoding later
    const frames = [];
    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
      renderProgress.update(frame + 1);
      const progress = frame / TOTAL_FRAMES;

      // Interpolate animation values and store the svg in frames
      const regex = /(?:from=")\d+.\d+/g;
      const newSVG = svg.replace(regex, (match) => {
        const [fromStr, currValueStr] = match.split('"');
        const currValue = parseFloat(currValueStr);
        const newValue = lerp(currValue, currValue + 360, progress);
        return [fromStr, newValue].join('"');
      });

      // Render the svg to the headless browser
      await page.setContent(
        `<!DOCTYPE html><style>* { margin: 0; padding: 0; }</style>${newSVG}`
      );

      const pngBuffer = await page.screenshot({
        clip: { width: GIF_DIMENSION, height: GIF_DIMENSION, x: 0, y: 0 },
      });

      frames.push(pngBuffer);
    }

    renderProgress.stop();
    console.log(`Generating gif for flower #${token.tokenId}`);
    encodeProgress.start(frames.length, 0);

    // Encode the gif from the png buffers
    for (let i = 0; i < frames.length; i++) {
      encodeProgress.update(i + 1);
      const frame = frames[i];
      const png = new PNG(frame);
      await decode(png).then((pixels) => encoder.addFrame(pixels));
    }

    encoder.finish();
    encodeProgress.stop();
  }

  // Close the headless browser
  await browser.close();

  console.log("Saved all the flower gifs into gifs folder");
})().catch((err) => {
  console.error(err);
});

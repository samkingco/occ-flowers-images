require("dotenv").config();

const fs = require("fs");
const path = require("path");
const cliProgress = require("cli-progress");

(async () => {
  const flowersData = fs.readFileSync(
    path.join(process.cwd(), "input/flowers.json")
  );
  const flowers = JSON.parse(flowersData);

  const allTokens = [];
  for (const [tokenId, token] of Object.entries(flowers)) {
    allTokens.push({
      tokenId,
      image: token.image,
    });
  }

  // Generate png files
  console.log("Rendering flower SVGs");

  const svgRenderProgress = new cliProgress.SingleBar();
  svgRenderProgress.start(allTokens.length, 0);

  for (const [index, token] of allTokens.entries()) {
    svgRenderProgress.update(index);

    // Get the raw SVG
    const svg = Buffer.from(token.image.substring(26), "base64").toString();

    // Save it to output folder
    fs.writeFileSync(
      path.join(process.cwd(), `image-files/svgs/${token.tokenId}.svg`),
      svg
    );
  }

  svgRenderProgress.stop();
  console.log("Saved all the flower SVGs into /image-files/svgs");
})().catch((err) => {
  console.error(err);
});

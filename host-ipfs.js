require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const src = "./image-files";

async function pinFileToIPFS(fileName) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  const data = new FormData();
  data.append(
    "file",
    fs.createReadStream(path.join(process.cwd(), src, fileName))
  );

  return axios.post(url, data, {
    maxBodyLength: "Infinity", // this prevents axios from erroring out with large files
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
  });
}

(async () => {
  const imageData = {};

  const flowersData = fs.readFileSync(
    path.join(process.cwd(), "input/flowers.json")
  );
  const flowers = JSON.parse(flowersData);

  for (const [tokenId, token] of Object.entries(flowers)) {
    imageData[tokenId] = {
      base64: token.image,
      svg: null,
      png: null,
      gif: null,
    };
  }

  const svgPaths = fs.readdirSync(path.join(process.cwd(), src, "svgs"));
  const pngPaths = fs.readdirSync(path.join(process.cwd(), src, "pngs"));
  const gifPaths = fs.readdirSync(path.join(process.cwd(), src, "gifs"));

  for (const svg of svgPaths) {
    const fileName = path.basename(svg);
    const tokenId = fileName.replace(".svg", "");

    console.log(`Uploading svg for flower #${tokenId}`);
    const res = await pinFileToIPFS(`svgs/${fileName}`);
    const data = res.data;

    imageData[parseInt(tokenId, 10)] = {
      ...imageData[parseInt(tokenId, 10)],
      svg: data.IpfsHash,
    };
  }

  for (const png of pngPaths) {
    const fileName = path.basename(png);
    const tokenId = fileName.replace(".png", "");

    console.log(`Uploading png for flower #${tokenId}`);
    const res = await pinFileToIPFS(`pngs/${fileName}`);
    const data = res.data;

    imageData[parseInt(tokenId, 10)] = {
      ...imageData[parseInt(tokenId, 10)],
      png: data.IpfsHash,
    };
  }

  for (const gif of gifPaths) {
    const fileName = path.basename(gif);
    const tokenId = fileName.replace(".gif", "");

    console.log(`Uploading gif for flower #${tokenId}`);
    const res = await pinFileToIPFS(`gifs/${fileName}`);
    const data = res.data;

    imageData[parseInt(tokenId, 10)] = {
      ...imageData[parseInt(tokenId, 10)],
      gif: data.IpfsHash,
    };
  }

  fs.writeFileSync(
    path.join(process.cwd(), "output/images.json"),
    JSON.stringify(imageData, null, 2)
  );

  console.log(
    "Put all the flowers on IPFS and stored info at output/images.json"
  );
})().catch((err) => {
  console.error(err);
});

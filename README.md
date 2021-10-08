# OCC Flowers IPFS images

This repository contains tooling and data for [OCC Flowers](https://www.occ.xyz/flowers), and is free to use without credit or attribution, for any means.

> OCC#1 🌺 Flowers is a collection 4096 programatically generated on-chain flowers, for you to own or to share. Each flower is 100% generated on-chain, including it's metadata. No ipfs/arweave, no external rendering script. Just SVGs created by the contract.

## What is it?

Flowers are currently stored on-chain in SVG format. This means you can grab the SVG file for a flower directly from the blockchain, no IPFS required. This is amazing, but because they're SVGs, some of which animate, it can be hard to share these beautiful works socially. Most sites don't easily support the SVG format.

This repo generates PNGs, GIFs for the flowers that animate, along with the original SVG files, and stores them on IPFS. This is only so flower enjoyers can more easily share them on things like Twitter and Discord.

⚠️ It's important to note, the assets on IPFS are essentially derivatives of the on-chain data. These are NOT the originals in the `tokenURI`. They are NOT part of any NFTs. ⚠️

## Output

`output/images.json` contains a mapping of `tokenId` to the respective image data. The `png` and `gif` fields are an IPFS content hash. You can view the image by appending `ipfs://` to the content hash, or by using an IPFS gateway by appending `https://ipfs.io/ipfs/` to the content hash.

```typescript
interface Token {
  base64: string;
  svg: string || null;
  png: string || null;
  gif: string || null;
}
```

```json
{
  "108": {
    "base64": "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTAwIDwMC...",
    "svg": "Qmc5UMQ1XotHGNGuxv4kmpQDtWVxL5XHLHTe2SyuJumHUX",
    "png": "Qmc5UMQ1XotHGNGuxv4kmpQDtWVxL5XHLHTe2SyuJumHUX",
    "gif": "QmQvUDaMKZ9LQKkej2649DDSLT3D16mwoXj4p4Jc9x391R"
  }
}
```

## Run locally

If you just want to generate image files locally, you can use the `make-svgs`, `make-pngs`, and `make-gifs` scripts.

However if you want to upload the generated images to IPFS, then you'll need a [Pinata](https://www.pinata.cloud/) JWT access token. The `host-ipfs` script uses [Pinata](https://www.pinata.cloud/) to pin assets to IPFS. You can provide the JWT by adding a `.env` file with a `PINATA_JWT` environment variable.

Bare in mind, these scripts do a lot of rendering. There's 4096 static flowers, and 402 animated flowers. Each script could take a long time to exectute fully depending on your machine.

```bash
# Install dependencies
npm install

# Generate SVGs of all the flowers
npm run make-svgs

# Generate PNGs of all the flowers
npm run make-pngs

# Generate GIFs of all the animated flowers
npm run make-gifs

# Upload all the images to IPFS and generate output/images.json
npm run host-ipfs
```

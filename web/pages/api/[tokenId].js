// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId
  const image_url = "https://ari-crypto-devs-nft.vercel.app/cryptodevs/"
  res.status(200).json({
    name: "Crypto Dev #" + tokenId,
    description: "Crypto Dev is a collection of developers NFTs in crypto",
    image: image_url + tokenId + ".svg",
  })
}

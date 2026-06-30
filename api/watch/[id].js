export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Missing IMDb ID");
  }

  let title = "Watch Movie Online";
  let description = "Watch online now";
  let image = "";

  try {
    const imdbUrl = `https://www.imdb.com/title/${id}/`;

    const response = await fetch(imdbUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const html = await response.text();

    // Method 1: OG tags
    const ogTitle =
      html.match(/property="og:title"\s+content="([^"]+)"/i) ||
      html.match(/content="([^"]+)"\s+property="og:title"/i);

    const ogImage =
      html.match(/property="og:image"\s+content="([^"]+)"/i) ||
      html.match(/content="([^"]+)"\s+property="og:image"/i);

    const metaDesc =
      html.match(/name="description"\s+content="([^"]+)"/i) ||
      html.match(/content="([^"]+)"\s+name="description"/i);

    if (ogTitle?.[1]) title = ogTitle[1];
    if (ogImage?.[1]) image = ogImage[1];
    if (metaDesc?.[1]) description = metaDesc[1];

    // Method 2: JSON-LD fallback
    if (!image || title === "Watch Movie Online") {
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
      );

      if (jsonLdMatch?.[1]) {
        try {
          const json = JSON.parse(jsonLdMatch[1]);

          if (json.name) title = json.name;
          if (json.image) {
            image = Array.isArray(json.image)
              ? json.image[0]
              : json.image;
          }
          if (json.description) {
            description = json.description;
          }
        } catch (e) {}
      }
    }
  } catch (err) {
    console.log("IMDb scrape failed:", err);
  }

  const playerUrl = `https://gemma416okl.com/play/${id}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${escapeHtml(title)}</title>

<meta property="og:type" content="video.movie">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://watch-any-movies.vercel.app/watch/${id}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${image}">

<style>
html,body{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  background:#000;
}
iframe{
  width:100vw;
  height:100vh;
  border:none;
}
</style>

</head>

<body>

<iframe
  src="${playerUrl}"
  allowfullscreen
  webkitallowfullscreen
  mozallowfullscreen>
</iframe>

</body>
</html>
`);
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

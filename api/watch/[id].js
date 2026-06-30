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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      }
    });

    const html = await response.text();

    function getMeta(html, property) {
      const regex = new RegExp(
        `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`,
        "i"
      );

      const match = html.match(regex);
      return match ? match[1] : "";
    }

    function getNameMeta(html, name) {
      const regex = new RegExp(
        `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`,
        "i"
      );

      const match = html.match(regex);
      return match ? match[1] : "";
    }

    const imdbTitle = getMeta(html, "og:title");
    const imdbImage = getMeta(html, "og:image");
    const imdbDescription = getNameMeta(html, "description");

    if (imdbTitle) title = imdbTitle;
    if (imdbImage) image = imdbImage;
    if (imdbDescription) description = imdbDescription;

    console.log({
      id,
      title,
      image,
      description
    });
  } catch (error) {
    console.error("IMDb scrape error:", error);
  }

  const playerUrl = `https://gemma416okl.com/play/${id}`;

  const escapeHtml = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${escapeHtml(title)}</title>

<meta name="description" content="${escapeHtml(description)}">

<meta property="og:type" content="video.movie">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://watch-any-movies.vercel.app/watch/${id}">
<meta property="og:site_name" content="Watch Any Movies">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${image}">

<style>
html,
body{
  margin:0;
  padding:0;
  width:100%;
  height:100%;
  overflow:hidden;
  background:#000;
}

iframe{
  width:100vw;
  height:100vh;
  border:none;
  display:block;
}
</style>

</head>

<body>

<iframe
  src="${playerUrl}"
  allowfullscreen
  webkitallowfullscreen
  mozallowfullscreen
  referrerpolicy="origin">
</iframe>

</body>
</html>
`);
}

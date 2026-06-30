export default async function handler(req, res) {
  const { id } = req.query;

  const imdbUrl = `https://www.imdb.com/title/${id}/`;

  let title = "Watch Online";
  let image = "";
  let description = "Watch online now";

  try {
    const response = await fetch(imdbUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const html = await response.text();

    const titleMatch =
      html.match(/property="og:title"\s+content="([^"]+)"/i) ||
      html.match(/content="([^"]+)"\s+property="og:title"/i);

    const imageMatch =
      html.match(/property="og:image"\s+content="([^"]+)"/i) ||
      html.match(/content="([^"]+)"\s+property="og:image"/i);

    const descMatch =
      html.match(/name="description"\s+content="([^"]+)"/i) ||
      html.match(/content="([^"]+)"\s+name="description"/i);

    if (titleMatch) title = titleMatch[1];
    if (imageMatch) image = imageMatch[1];
    if (descMatch) description = descMatch[1];
  } catch (e) {
    console.log(e);
  }

  const iframeUrl = `https://gemma416okl.com/play/${id}`;

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

<meta property="og:url"
content="https://watch-any-movies.vercel.app/watch/${id}">

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
src="${iframeUrl}"
allowfullscreen
webkitallowfullscreen
mozallowfullscreen
referrerpolicy="origin">
</iframe>

</body>
</html>
`);
}

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

from http.server import BaseHTTPRequestHandler
import requests
from bs4 import BeautifulSoup
import html


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            path = self.path

            imdb_id = path.rstrip("/").split("/")[-1]

            title = "Watch Movie Online"
            description = "Watch online now"
            image = ""

            imdb_url = f"https://www.imdb.com/title/{imdb_id}/"

            response = requests.get(
                imdb_url,
                headers={
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/125.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9"
                },
                timeout=20
            )

            soup = BeautifulSoup(response.text, "html.parser")

            og_title = soup.find("meta", property="og:title")
            og_image = soup.find("meta", property="og:image")
            meta_desc = soup.find(
                "meta",
                attrs={"name": "description"}
            )

            if og_title and og_title.get("content"):
                title = og_title["content"]

            if og_image and og_image.get("content"):
                image = og_image["content"]

            if meta_desc and meta_desc.get("content"):
                description = meta_desc["content"]

        except Exception as e:
            print("IMDb scrape error:", e)

        player_url = f"https://gemma416okl.com/play/{imdb_id}"

        page = f"""
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="utf-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1, viewport-fit=cover">

<title>{html.escape(title)}</title>

<meta
name="description"
content="{html.escape(description)}">

<meta property="og:type" content="video.movie">

<meta
property="og:title"
content="{html.escape(title)}">

<meta
property="og:description"
content="{html.escape(description)}">

<meta
property="og:image"
content="{image}">

<meta
property="og:image:secure_url"
content="{image}">

<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta
property="og:url"
content="https://watch-any-movies.vercel.app/watch/{imdb_id}">

<meta
property="og:site_name"
content="Watch Any Movies">

<meta
name="twitter:card"
content="summary_large_image">

<meta
name="twitter:title"
content="{html.escape(title)}">

<meta
name="twitter:description"
content="{html.escape(description)}">

<meta
name="twitter:image"
content="{image}">

<style>

:root {{
  --app-height:100vh;
}}

* {{
  margin:0;
  padding:0;
  box-sizing:border-box;
}}

html,
body {{
  width:100%;
  height:100%;
  overflow:hidden;
  background:#000;
}}

.player-container {{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100dvh;
  height:var(--app-height);
  overflow:hidden;
  background:#000;
}}

iframe {{
  display:block;
  width:100%;
  height:100%;
  border:none;
  background:#000;
}}

</style>

</head>

<body>

<div class="player-container">
  <iframe
    src="{player_url}"
    allowfullscreen
    webkitallowfullscreen
    mozallowfullscreen
    allow="fullscreen; autoplay; encrypted-media; picture-in-picture">
  </iframe>
</div>

<script>

function setAppHeight() {{
  document.documentElement.style.setProperty(
    '--app-height',
    window.innerHeight + 'px'
  );
}}

setAppHeight();

window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);

setTimeout(setAppHeight, 500);
setTimeout(setAppHeight, 1000);

</script>

</body>
</html>
"""

        self.send_response(200)
        self.send_header(
            "Content-Type",
            "text/html; charset=utf-8"
        )
        self.end_headers()
        self.wfile.write(page.encode("utf-8"))

from http.server import BaseHTTPRequestHandler
from playwright.sync_api import sync_playwright
import html


class handler(BaseHTTPRequestHandler):

    def do_GET(self):

        imdb_id = self.path.rstrip("/").split("/")[-1]

        title = "Watch Movie Online"
        description = "Watch online now"
        image = ""

        try:
            imdb_url = f"https://www.imdb.com/title/{imdb_id}/"

            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True
                )

                page = browser.new_page(
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/137.0.0.0 Safari/537.36"
                    )
                )

                page.goto(
                    imdb_url,
                    wait_until="domcontentloaded",
                    timeout=30000
                )

                page.wait_for_timeout(3000)

                try:
                    title = page.locator(
                        'meta[property="og:title"]'
                    ).get_attribute("content") or title
                except:
                    pass

                try:
                    image = page.locator(
                        'meta[property="og:image"]'
                    ).get_attribute("content") or image
                except:
                    pass

                try:
                    description = page.locator(
                        'meta[property="og:description"]'
                    ).get_attribute("content") or description
                except:
                    pass

                browser.close()

        except Exception as e:
            print("Playwright scrape error:", e)

        player_url = f"https://gemma416okl.com/play/{imdb_id}"

        page_html = f"""
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
  inset:0;
  width:100%;
  height:100dvh;
  height:var(--app-height);
  background:#000;
}}

iframe {{
  width:100%;
  height:100%;
  border:none;
  display:block;
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
        self.wfile.write(page_html.encode("utf-8"))

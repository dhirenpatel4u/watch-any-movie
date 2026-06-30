from playwright.sync_api import sync_playwright
from html import escape

def handler(request):
path = request.path

imdb_id = path.rstrip("/").split("/")[-1]

title = "Watch Movie Online"
description = "Watch online now"
image = ""

try:
    imdb_url = f"https://www.imdb.com/title/{imdb_id}/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

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
            title = (
                page.locator(
                    'meta[property="og:title"]'
                ).get_attribute("content")
                or title
            )
        except Exception:
            pass

        try:
            image = (
                page.locator(
                    'meta[property="og:image"]'
                ).get_attribute("content")
                or image
            )
        except Exception:
            pass

        try:
            description = (
                page.locator(
                    'meta[name="description"]'
                ).get_attribute("content")
                or description
            )
        except Exception:
            pass

        browser.close()

except Exception as e:
    print("Playwright error:", e)

player_url = f"https://gemma416okl.com/play/{imdb_id}"

html_page = f"""

<!DOCTYPE html>

<html> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">

<title>{escape(title)}</title>

<meta name="description" content="{escape(description)}">

<meta property="og:type" content="video.movie"> <meta property="og:title" content="{escape(title)}"> <meta property="og:description" content="{escape(description)}"> <meta property="og:image" content="{image}"> <meta property="og:image:secure_url" content="{image}"> <meta property="og:image:width" content="1200"> <meta property="og:image:height" content="630">

<meta property="og:url" content="https://watch-any-movies.vercel.app/watch/{imdb_id}">

<meta property="og:site_name" content="Watch Any Movies">

<meta name="twitter:card" content="summary_large_image">

<meta name="twitter:title" content="{escape(title)}">

<meta name="twitter:description" content="{escape(description)}">

<meta name="twitter:image" content="{image}">

<style> :root {{ --app-height:100vh; }} html,body {{ margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }} .player {{ position:fixed; inset:0; width:100%; height:100dvh; height:var(--app-height); }} iframe {{ width:100%; height:100%; border:none; display:block; }} </style>

</head>

<body>

<div class="player"> <iframe src="{player_url}" allowfullscreen webkitallowfullscreen mozallowfullscreen allow="fullscreen; autoplay; encrypted-media; picture-in-picture"> </iframe> </div>

<script> function setAppHeight() {{ document.documentElement.style.setProperty( '--app-height', window.innerHeight + 'px' ); }} setAppHeight(); window.addEventListener('resize', setAppHeight); window.addEventListener('orientationchange', setAppHeight); </script>

</body> </html> """

return {
    "statusCode": 200,
    "headers": {
        "Content-Type": "text/html; charset=utf-8"
    },
    "body": html_page
}

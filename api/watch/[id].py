from http.server import BaseHTTPRequestHandler
import requests
from bs4 import BeautifulSoup
import html


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            imdb_id = self.path.split("/")[-1].split("?")[0]

            title = "Watch Movie Online"
            description = "Watch online now"
            image = ""

            imdb_url = f"https://www.imdb.com/title/{imdb_id}/"

            response = requests.get(
                imdb_url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/125.0.0.0 Safari/537.36"
                    ),
                    "Accept-Language": "en-US,en;q=0.9"
                },
                timeout=15
            )

            soup = BeautifulSoup(response.text, "html.parser")

            og_title = soup.find("meta", property="og:title")
            og_image = soup.find("meta", property="og:image")
            meta_desc = soup.find("meta", attrs={"name": "description"})

            if og_title and og_title.get("content"):
                title = og_title["content"]

            if og_image and og_image.get("content"):
                image = og_image["content"]

            if meta_desc and meta_desc.get("content"):
                description = meta_desc["content"]

        except Exception as e:
            print("IMDb scrape error:", e)

        player_url = f"https://gemma416okl.com/play/{imdb_id}"

        html_response = f"""
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>{html.escape(title)}</title>

<meta name="description"
      content="{html.escape(description)}">

<meta property="og:type" content="video.movie">
<meta property="og:title"
      content="{html.escape(title)}">

<meta property="og:description"
      content="{html.escape(description)}">

<meta property="og:image"
      content="{image}">

<meta property="og:image:secure_url"
      content="{image}">

<meta property="og:image:width"
      content="1200">

<meta property="og:image:height"
      content="630">

<meta property="og:url"
      content="https://watch-any-movies.vercel.app/watch/{imdb_id}">

<meta property="og:site_name"
      content="Watch Any Movies">

<meta name="twitter:card"
      content="summary_large_image">

<meta name="twitter:title"
      content="{html.escape(title)}">

<meta name="twitter:description"
      content="{html.escape(description)}">

<meta name="twitter:image"
      content="{image}">

<style>
html,body{{
margin:0;
padding:0;
width:100%;
height:100%;
overflow:hidden;
background:#000;
}}

iframe{{
width:100vw;
height:100vh;
border:none;
display:block;
}}
</style>

</head>

<body>

<iframe
src="{player_url}"
allowfullscreen
webkitallowfullscreen
mozallowfullscreen>
</iframe>

</body>
</html>
"""

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html_response.encode("utf-8"))

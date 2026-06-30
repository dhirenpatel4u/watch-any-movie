from playwright.sync_api import sync_playwright
from html import escape


def handler(request):

    imdb_id = request.path.rstrip("/").split("/")[-1]

    title = "Watch Movie Online"
    description = "Watch online now"
    image = ""

    debug = ""

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

            debug += f"Loaded IMDb page\n"

            try:
                title_meta = page.locator(
                    'meta[property="og:title"]'
                ).get_attribute("content")

                if title_meta:
                    title = title_meta

                debug += f"TITLE OK: {title}\n"

            except Exception as e:
                debug += f"TITLE ERROR: {str(e)}\n"

            try:
                image_meta = page.locator(
                    'meta[property="og:image"]'
                ).get_attribute("content")

                if image_meta:
                    image = image_meta

                debug += f"IMAGE OK\n"

            except Exception as e:
                debug += f"IMAGE ERROR: {str(e)}\n"

            try:
                desc_meta = page.locator(
                    'meta[name="description"]'
                ).get_attribute("content")

                if desc_meta:
                    description = desc_meta

                debug += f"DESCRIPTION OK\n"

            except Exception as e:
                debug += f"DESCRIPTION ERROR: {str(e)}\n"

            browser.close()

    except Exception as e:
        debug += f"\nPLAYWRIGHT ERROR:\n{str(e)}\n"

    # DEBUG MODE
    # Shows exactly what Vercel sees
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "text/plain"
        },
        "body": f"""
IMDb ID: {imdb_id}

TITLE:
{title}

IMAGE:
{image}

DESCRIPTION:
{description}

-----------------------

DEBUG:

{debug}
"""
    }

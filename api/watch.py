from playwright.sync_api import sync_playwright

def handler(request):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://www.imdb.com/title/tt37971394/")
        title = page.title()
        browser.close()

    return {
        "title": title
    }

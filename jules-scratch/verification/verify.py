import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page()

            # Capture console messages
            page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

            await page.goto(f'http://localhost:8000/examples/selection.html')
            await expect(page.locator("#verificationCanvas")).to_be_visible()
            await page.wait_for_timeout(5000) # Increased to 5 seconds
            await page.screenshot(path='jules-scratch/verification/verification.png')
        finally:
            await browser.close()

asyncio.run(main())

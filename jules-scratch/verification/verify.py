from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Add a handler for browser console messages
    page.on('console', lambda msg: print(f"BROWSER LOG: {msg.text}"))

    # Verify SVG test page
    print("\n--- Verifying svg_and_gradient_test.html ---")
    page.goto("http://localhost:8000/examples/svg_and_gradient_test.html")
    page.wait_for_timeout(2000)  # Wait for async image loading and any errors
    page.screenshot(path="jules-scratch/verification/svg_test.png")
    print("Took screenshot of svg_and_gradient_test.html")

    # Verify HTML image test page
    print("\n--- Verifying image.html ---")
    page.goto("http://localhost:8000/examples/image.html")
    page.wait_for_timeout(1000)
    page.screenshot(path="jules-scratch/verification/image_test.png")
    print("Took screenshot of image.html")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

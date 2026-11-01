
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from urllib.parse import urlparse

driver = webdriver.Chrome()

working_links = []
broken_links = []
skipped_links = []

try:
    driver.get("https://ds-theta.vercel.app/")

    # Collect all links
    links = driver.find_elements(By.TAG_NAME, "a")

    print("Total links found:", len(links))

    for link in links:
        url = link.get_attribute("href")
        name = link.text.strip()

        # Skip empty and unsupported links
        if not url:
            skipped_links.append(name)
            continue

        if url.startswith(("mailto:", "tel:", "javascript:")):
            skipped_links.append(url)
            continue

        try:
            # Check HTTP response
            response = requests.get(
                url,
                timeout=15,
                allow_redirects=True,
                stream=True
            )

            status = response.status_code
            response.close()

            if status >= 400:
                broken_links.append((name, url, status))
                print("BROKEN:", name, status, url)
            else:
                working_links.append(url)
                print("WORKING:", name, status, url)

        except requests.RequestException as error:
            broken_links.append((name, url, str(error)))
            print("ERROR:", name, error)

finally:
    driver.quit()

# Final report
print("\n========== QA REPORT ==========")
print("Working links:", len(working_links))
print("Broken links:", len(broken_links))
print("Skipped links:", len(skipped_links))

print("\n========== BROKEN LINKS ==========")

for name, url, status in broken_links:
    print(name, "|", url, "|", status)

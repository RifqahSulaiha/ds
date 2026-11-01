
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()

try:
    driver.get("https://ds-theta.vercel.app/")

    print("Website:", driver.current_url)

    # Find all links
    links = driver.find_elements(By.TAG_NAME, "a")

    print("Total links:", len(links))

    # Display link names and destinations
    for link in links:
        name = link.text.strip()
        url = link.get_attribute("href")

        print("----------------------")
        print("Link Name:", name)
        print("Destination:", url)

finally:
    driver.quit()

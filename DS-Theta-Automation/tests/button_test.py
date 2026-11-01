
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

try:
    driver.get("https://ds-theta.vercel.app/")

    wait = WebDriverWait(driver, 10)

    # Find all buttons
    buttons = driver.find_elements(By.TAG_NAME, "button")

    print("Total buttons:", len(buttons))

    # Print their names
    for button in buttons:
        print("Button:", button.text)

    # Example: click the first visible enabled button
    for button in buttons:
        if button.is_displayed() and button.is_enabled():
            print("Clicking:", button.text)
            button.click()
            break

finally:
    driver.quit()

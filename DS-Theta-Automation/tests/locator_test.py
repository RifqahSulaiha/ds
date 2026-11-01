
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()

driver.get("https://ds-theta.vercel.app/")

# Find all buttons on the page
buttons = driver.find_elements(By.TAG_NAME, "button")

print("Total buttons:", len(buttons))

# Print button text
for button in buttons:
    print("Button:", button.text)

driver.quit()


from selenium import webdriver

# Step 1: Open Chrome
driver = webdriver.Chrome()

# Step 2: Open your deployed website
driver.get("https://ds-theta.vercel.app/")

# Step 3: Get website title
title = driver.title

# Step 4: Print website title
print("Website Title:", title)

# Step 5: Verify website title
assert title != "", "Website title is missing!"

print("TEST PASSED: Website opened successfully")

# Step 6: Close Chrome
driver.quit()

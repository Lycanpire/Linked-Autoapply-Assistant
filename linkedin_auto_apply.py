import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ========== USER DATA ==========
PHONE = "+917895152544"
EMAIL = "saaj.work@gmail.com"
CURRENT_CTC = "1500000"
EXPECTED_CTC = "2000000"
NOTICE_PERIOD_DAYS = "30"
YEARS_OF_EXPERIENCE = "4"

BLACKLIST = ["paytm", "one 97", "iris gst", "sovos"]
# ===============================

import os

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("detach", True)
    options.add_argument("--start-maximized")
    options.page_load_strategy = 'eager'
    
    # Path to store Chrome profile data so we don't need to login every time
    profile_path = os.path.join(os.getcwd(), "chrome_profile")
    options.add_argument(f"user-data-dir={profile_path}")
    
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def contains_blacklist(text):
    text = text.lower()
    return any(b in text.lower() for b in BLACKLIST)

def wait(sec=2):
    time.sleep(sec)

def fill_inputs(driver):
    # Find all input fields (text, number) in the modal
    try:
        inputs = driver.find_elements(By.XPATH, "//input[not(@type='hidden') and not(@type='file')]")
        for input_box in inputs:
            field_id = input_box.get_attribute("id")
            if field_id:
                # Find label for this input using the 'for' attribute
                label = driver.find_elements(By.XPATH, f"//label[@for='{field_id}']")
                if label:
                    text_label = label[0].text.lower()
                    val = ""
                    if any(k in text_label for k in ["phone", "mobile"]): val = PHONE
                    elif any(k in text_label for k in ["email"]): val = EMAIL
                    elif any(k in text_label for k in ["current ctc", "current salary"]): val = CURRENT_CTC
                    elif any(k in text_label for k in ["expected ctc", "expected salary"]): val = EXPECTED_CTC
                    elif any(k in text_label for k in ["notice period", "notice"]): val = NOTICE_PERIOD_DAYS
                    elif any(k in text_label for k in ["experience", "years"]): val = YEARS_OF_EXPERIENCE
                    
                    if val and not input_box.get_attribute("value"):
                        # Clear existing content carefully and type value
                        input_box.send_keys(Keys.COMMAND + "a")
                        input_box.send_keys(Keys.DELETE)
                        input_box.send_keys(val)
    except Exception as e:
        pass

def close_modal(driver):
    try:
        # Click the 'X' dismiss icon on the modal if it exists
        dismiss_buttons = driver.find_elements(By.CSS_SELECTOR, "button[aria-label='Dismiss']")
        if dismiss_buttons:
            dismiss_buttons[0].click()
            wait(1)
            # Confirm by clicking 'Discard' in the secondary dialog
            discard_button = driver.find_elements(By.XPATH, "//button[span[contains(text(), 'Discard')]]")
            if discard_button:
                discard_button[0].click()
                wait(1)
    except Exception:
        pass

def close_modal_if_done(driver):
    try:
        # Sometimes after submitting there's a success dialog with a 'Done' button
        done_btn = driver.find_elements(By.XPATH, "//button[span[contains(text(), 'Done')]]")
        if done_btn:
            done_btn[0].click()
            wait(1)
    except:
        pass
    # Backup step to ensure the modal is closed before moving to the next job
    close_modal(driver)

def apply_to_job(driver, job_card):
    try:
        # Avoid clicking issues by scrolling into center
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", job_card)
        wait(1)
        job_card.click()
        wait(2)

        company = job_card.text
        if contains_blacklist(company):
            print("  Skipped blacklisted company (from list)")
            return

        # Locate Easy Apply button on the detailed right panel
        easy_apply = driver.find_elements(By.XPATH, "//button[contains(@class, 'jobs-apply-button')]")
        if not easy_apply:
            print("  No 'Easy Apply' button available for this job.")
            return

        easy_apply[0].click()
        wait(2)

        # Iterate through the Easy Apply modal pages
        max_modal_pages = 10
        for _ in range(max_modal_pages):
            # Attempt to fill any known inputs on the current page
            fill_inputs(driver)
            wait(1)
            
            # Look for the primary progression button
            next_btn = driver.find_elements(By.XPATH, "//button[contains(@class, 'artdeco-button--primary') and span[contains(text(), 'Next') or contains(text(), 'Review') or contains(text(), 'Submit')]]")
            
            if next_btn:
                btn = next_btn[0]
                # If the button is disabled, we're stuck (likely missing an unknown mandatory field)
                if btn.get_attribute("disabled"):
                    print("  Stuck on mandatory fields. Discarding application.")
                    close_modal(driver)
                    return
                
                btn_text = btn.text.lower()
                btn.click()
                wait(2)
                
                if "submit" in btn_text:
                    print("  --> Applied Successfully!")
                    close_modal_if_done(driver)
                    return
            else:
                # No primary button found, which might mean we are done or error page
                break
                
        # If loop finishes and modal is still open, try to discard it
        close_modal(driver)
            
    except Exception as e:
        print(f"  Skipped job due to internal error.")
        close_modal(driver)

def main():
    driver = setup_driver()
    driver.get("https://www.linkedin.com/login")

    input("Login manually, then press ENTER here...")

    # Open LinkedIn job search with "Easy Apply" filter on
    driver.get("https://www.linkedin.com/jobs/search/?f_AL=true")
    wait(3)

    # Process up to 5 pages of job results
    for page in range(1, 6):
        print(f"\n=== Processing Page {page} ===")
        try:
            # Wait until job cards exist on the page
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "job-card-container")))
            
            # Scroll down the job list panel step-by-step to lazily load all 25 jobs
            jobs_list_panel = driver.find_element(By.CLASS_NAME, "jobs-search-results-list")
            for _ in range(5):
                driver.execute_script("arguments[0].scrollTop += arguments[0].offsetHeight;", jobs_list_panel)
                wait(1)
            
            # Gather all loaded job cards
            jobs = driver.find_elements(By.CLASS_NAME, "job-card-container")
            
            for i, job in enumerate(jobs):
                print(f"Checking job {i+1} of {len(jobs)} on page {page}...")
                apply_to_job(driver, job)
                wait(1)
                
            # Click the exact pagination button for the next page
            next_page_btn = driver.find_elements(By.XPATH, f"//button[@aria-label='Page {page + 1}']")
            if next_page_btn:
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_page_btn[0])
                wait(1)
                next_page_btn[0].click()
                wait(3)
            else:
                print("No more pages available. Reached the end.")
                break
                
        except Exception as e:
            print(f"Could not load jobs on page {page}.")
            break

    print("\nAll done!")

if __name__ == "__main__":
    main()

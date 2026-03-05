# LinkedIn Auto Apply Assistant

A lightweight Google Chrome Extension that automates the process of executing "Easy Apply" applications on LinkedIn Jobs. It saves you time by cycling through the job feed, clicking into applications, auto-filling your personal details, answering repetitive additional questions, and submitting the applications for you.

![LinkedIn Auto Apply Logo](extension/Icon.png)

## Features

- **One-Click Automation**: Just hit "Start Auto Apply" from the popup and let it run.
- **Auto-Fill Details**: Fills common required fields like Phone Number, Email, Current CTC, Expected CTC, Notice Period, and Years of Experience.
- **Smart Radio & Dropdown Handling**: Automatically selects "Yes" for common additional questions regarding:
  - Commuting / Onsite work
  - Relocation
  - Hybrid work
  - Work Authorization
  - Security Clearance
  - Visa Sponsorship
- **Multi-Step Applications**: Capable of clicking "Next" through multi-page application modals.
- **Auto-Discard**: Automatically skips jobs with unanswerable mandatory fields (by gracefully clicking discard) to prevent getting stuck.
- **Company Blacklist**: Avoids applying to specific companies you don't want to work for.
- **Lazy Loading & Pagination**: Automatically scrolls the job feed to load new elements, and clicks to the next page of Search Results.
- **Persistent Sessions**: Unlike heavy WebDriver bots, running as an extension means you don't have to log in manually every time.

## Installation

Because this extension is not currently published on the Chrome Web Store, you will need to load it locally.

1. Clone or download this repository to your computer.
2. Open Google Chrome.
3. Navigate to `chrome://extensions/` in your address bar.
4. Toggle **Developer mode** in the top right corner.
5. Click **Load unpacked** in the top left corner.
6. Select the `extension/` folder inside this repository.
7. The **"LinkedIn Auto Apply Bot"** should now appear in your extensions list.

## Configuration

Before you start applying, you need to configure your personal details so the extension knows what to type into the form fields.

1. Open `extension/content.js` in your favorite code or text editor.
2. At the very top of the file, replace the placeholder constants with your actual information:

```javascript
const PHONE = "+910000000000";
const EMAIL = "your.email@gmail.com";
const CURRENT_CTC = "1500000";
const EXPECTED_CTC = "2000000";
const NOTICE_PERIOD_DAYS = "30";
const YEARS_OF_EXPERIENCE = "4";

// Add any companies you want the bot to completely skip matching the names
const BLACKLIST = ["paytm", "one 97", "iris gst", "sovos"];
```

3. Save the file.
4. Go back to `chrome://extensions/` and click the refresh icon (↻) on the extension card to load your new details.

## Usage

1. Go to the [LinkedIn Jobs Search](https://www.linkedin.com/jobs/search/?f_AL=true) page. Ensure you are completely logged in.
2. Search for your desired job title and location.
3. Ensure the **"Easy Apply"** filter button is toggled ON.
4. Click the extension icon in your Chrome toolbar.
5. Click **Start Auto Apply**.
6. Sit back and watch! (Or leave the tab open in the background).

### Monitoring Progress
You can Right-Click anywhere on the page -> **Inspect** -> **Console** to see detailed logs of exactly what the bot is doing (e.g., jobs skipped, successful applications, pauses).

## Important Notice

**Use at your own risk.** LinkedIn actively detects intensive bot activity. While this extension uses DOM-level event simulation and random delays to mimic human interaction, completely unsupervised mass-spamming may lead to account restrictions. It is highly recommended to use this to *assist* your job hunt by supervising it in small bursts (e.g., 5 pages at a time).

---
*Included in the root is the older `linkedin_auto_apply.py` script for those who still prefer a Selenium Python WebDriver approach.*

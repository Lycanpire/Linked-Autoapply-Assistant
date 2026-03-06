function getProfile() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "fetch_profile" }, (response) => {
            if (response && response.success) {
                resolve(response.data);
            } else {
                reject(new Error(response ? response.error : "Failed to connect to background script."));
            }
        });
    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function containsBlacklist(text, blacklist) {
    if (!blacklist || blacklist.length === 0) return false;
    text = text.toLowerCase();
    return blacklist.some(company => text.includes(company.toLowerCase()));
}

async function fillInputs(profile) {
    try {
        // Handle text/number inputs
        const inputs = document.querySelectorAll("input:not([type='hidden']):not([type='file']):not([type='radio'])");
        for (let inputBox of inputs) {
            const fieldId = inputBox.getAttribute("id");
            if (fieldId) {
                const label = document.querySelector(`label[for='${fieldId}']`);
                if (label) {
                    const textLabel = label.innerText.toLowerCase();
                    let val = "";

                    if (["phone", "mobile"].some(k => textLabel.includes(k))) val = profile.phone;
                    else if (["email"].some(k => textLabel.includes(k))) val = profile.email;
                    else if (textLabel.includes("salary") || textLabel.includes("ctc") || textLabel.includes("pay")) {
                        if (textLabel.includes("expected") || textLabel.includes("new")) val = profile.expectedCtc;
                        else val = profile.currentCtc;
                    }
                    else if (["notice period", "notice"].some(k => textLabel.includes(k))) val = profile.noticePeriod;
                    else if (["experience", "years"].some(k => textLabel.includes(k))) val = profile.experience;

                    if (val && !inputBox.value) {
                        try {
                            inputBox.value = ''; // clear

                            // Simulate human typing for React/Angular event listeners
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            nativeInputValueSetter.call(inputBox, val);
                            const event = new Event('input', { bubbles: true });
                            inputBox.dispatchEvent(event);
                        } catch (e) { }
                    }
                }
            }
        }

        // Handle radio buttons (like "Are you comfortable commuting?")
        const fieldsets = document.querySelectorAll("fieldset");
        for (let fieldset of fieldsets) {
            const legend = fieldset.querySelector("legend");
            if (legend) {
                const questionText = legend.innerText.toLowerCase();

                // If it asks about commuting, onsite, relocating, etc., pick Yes.
                if (questionText.includes("commute") ||
                    questionText.includes("commuting") ||
                    questionText.includes("onsite") ||
                    questionText.includes("relocate") ||
                    questionText.includes("hybrid") ||
                    questionText.includes("require sponsorship") || // Usually required to answer eventually
                    questionText.includes("clearance") ||
                    questionText.includes("authorized")) {

                    // Find the "Yes" radio button label inside this fieldset
                    const labels = fieldset.querySelectorAll("label");
                    for (let label of labels) {
                        if (label.innerText.trim().toLowerCase() === "yes") {
                            // Only click if it's not already selected
                            const radioBtn = document.getElementById(label.getAttribute("for"));
                            if (radioBtn && !radioBtn.checked) {
                                label.click();
                            }
                            break;
                        }
                    }
                }
            }
        }

        // Handle dropdown menus (Select tags like "Willing to relocate?")
        const selects = document.querySelectorAll("select");
        for (let select of selects) {
            const fieldId = select.getAttribute("id");
            if (fieldId && !select.value) { // Don't override if already selected
                let questionText = "";
                const label = document.querySelector(`label[for='${fieldId}']`);
                if (label) {
                    questionText = label.innerText.toLowerCase();
                } else {
                    // Sometimes LinkedIn puts the label near the select instead of linking it by ID
                    const parentText = select.parentElement ? select.parentElement.innerText.toLowerCase() : "";
                    questionText = parentText;
                }

                if (questionText.includes("notice period") || questionText.includes("notice")) {
                    const noticeVal = profile.noticePeriod ? profile.noticePeriod.toLowerCase() : "";
                    const options = select.querySelectorAll("option");
                    if (noticeVal) {
                        for (let option of options) {
                            if (option.innerText.toLowerCase().includes(noticeVal)) {
                                select.value = option.value;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                break;
                            }
                        }
                    }
                } else if (questionText.includes("commute") ||
                    questionText.includes("commuting") ||
                    questionText.includes("onsite") ||
                    questionText.includes("relocate") ||
                    questionText.includes("hybrid") ||
                    questionText.includes("sponsorship") ||
                    questionText.includes("clearance") ||
                    questionText.includes("authorized") ||
                    questionText.includes("willing to") ||
                    questionText.includes("office")) {

                    const options = select.querySelectorAll("option");
                    for (let option of options) {
                        if (option.innerText.trim().toLowerCase() === "yes") {
                            select.value = option.value;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        }
                    }
                }
            }
        }

        // Handle checkboxes (like Terms and Conditions or Privacy Policy)
        const checkboxes = document.querySelectorAll("input[type='checkbox']");
        for (let checkbox of checkboxes) {
            if (!checkbox.checked) {
                const fieldId = checkbox.getAttribute("id");
                let textLabel = "";
                if (fieldId) {
                    const label = document.querySelector(`label[for='${fieldId}']`);
                    if (label) textLabel = label.innerText.toLowerCase();
                }
                if (!textLabel && checkbox.parentElement) {
                    textLabel = checkbox.parentElement.innerText.toLowerCase();
                }

                if (textLabel.includes("agree") || textLabel.includes("terms") || textLabel.includes("conditions") || textLabel.includes("privacy") || textLabel.includes("policy") || textLabel.includes("acknowledge")) {
                    // Try to click the label first, otherwise the checkbox
                    const label = fieldId ? document.querySelector(`label[for='${fieldId}']`) : null;
                    if (label) label.click();
                    else checkbox.click();
                }
            }
        }

    } catch (e) { }
}

async function closeModal() {
    try {
        const dismissBtns = document.querySelectorAll("button[aria-label='Dismiss']");
        if (dismissBtns.length > 0) {
            dismissBtns[0].click();
            await sleep(1000);

            const discardBtns = Array.from(document.querySelectorAll("button")).filter(b => b.innerText.includes('Discard'));
            if (discardBtns.length > 0) {
                discardBtns[0].click();
                await sleep(1000);
            }
        }
    } catch (e) { }
}

async function applyToJob(jobCard, profile) {
    try {
        jobCard.scrollIntoView({ block: 'center' });
        await sleep(1000);
        jobCard.click();
        await sleep(2000);

        const companyNameElement = jobCard.querySelector('.job-card-container__primary-description');
        const company = companyNameElement ? companyNameElement.innerText : "";

        if (containsBlacklist(company, profile.blacklist)) {
            console.log("Skipped blacklisted company: " + company);
            return;
        }

        const easyApplyBtns = Array.from(document.querySelectorAll("button")).filter(b => b.classList.contains('jobs-apply-button'));

        if (easyApplyBtns.length === 0) {
            console.log("No Easy Apply button available.");
            return;
        }

        easyApplyBtns[0].click();
        await sleep(2000);

        const maxModalPages = 10;
        for (let i = 0; i < maxModalPages; i++) {
            await fillInputs(profile);
            await sleep(1000);

            // If we are stuck on a page with validation errors, discard to avoid infinite loop
            const errorElements = document.querySelectorAll(".artdeco-inline-feedback--error, [data-test-form-builder-error-message]");
            let hasVisibleErrors = false;
            for (let err of errorElements) {
                if (err.offsetParent !== null) hasVisibleErrors = true;
            }
            if (hasVisibleErrors) {
                console.log("Validation errors found. Discarding to avoid getting stuck.");
                await closeModal();
                return;
            }

            const nextBtns = Array.from(document.querySelectorAll("button.artdeco-button--primary")).filter(b => {
                const text = b.innerText.toLowerCase();
                return text.includes('next') || text.includes('review') || text.includes('submit');
            });

            if (nextBtns.length > 0) {
                const btn = nextBtns[0];
                if (btn.disabled) {
                    console.log("Stuck on mandatory fields. Discarding.");
                    await closeModal();
                    return;
                }

                const btnText = btn.innerText.toLowerCase();
                btn.click();
                await sleep(2000);

                if (btnText.includes('submit')) {
                    console.log("Applied Successfully!");
                    await sleep(1000);

                    const doneBtns = Array.from(document.querySelectorAll("button")).filter(b => b.innerText.includes('Done'));
                    if (doneBtns.length > 0) doneBtns[0].click();
                    else await closeModal();

                    return;
                }
            } else {
                break;
            }
        }
        await closeModal();
    } catch (e) {
        console.error("Skipped job due to error: ", e);
        await closeModal();
    }
}

let isRunning = false;

async function runAutofill() {
    if (isRunning) return;

    let profile;
    try {
        profile = await getProfile();
    } catch (error) {
        alert("Job Bot Error: " + error.message);
        isRunning = false;
        return;
    }

    if (!profile.phone || !profile.email) {
        alert("Please log in and configure your details on the Job Bot Dashboard (http://localhost:3000/dashboard) before starting!");
        isRunning = false;
        return;
    }

    isRunning = true;
    console.log("Starting Auto Apply Process...");

    // Check if we are on the jobs search page
    if (!window.location.href.includes("linkedin.com/jobs/search")) {
        alert("Please navigate to LinkedIn Jobs Search first!");
        isRunning = false;
        return;
    }

    try {
        // Find job list panel
        const jobsListPanel = document.querySelector(".jobs-search-results-list");
        if (jobsListPanel) {
            // Scroll down cleanly 5 times to load jobs
            for (let i = 0; i < 5; i++) {
                if (!isRunning) return;
                jobsListPanel.scrollTop += jobsListPanel.offsetHeight;
                await sleep(1000);
            }
        }

        let jobs = document.querySelectorAll(".job-card-container");
        for (let i = 0; i < jobs.length; i++) {
            if (!isRunning) {
                console.log("Auto Apply Paused.");
                return;
            }
            console.log(`Checking job ${i + 1} of ${jobs.length}...`);
            await applyToJob(jobs[i], profile);
            await sleep(1500);
        }

        alert("Finished applying to jobs on this page!");
        isRunning = false;

    } catch (e) {
        console.error("Critical error in autofill script.", e);
        isRunning = false;
    }
}

// Listen for messages from popup to trigger the script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "start_applying") {
        runAutofill();
    } else if (request.action === "stop_applying") {
        isRunning = false;
    }
});

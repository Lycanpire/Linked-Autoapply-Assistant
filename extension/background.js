// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("LinkedIn Auto Apply Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetch_profile") {
        fetch('http://localhost:3000/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized. Please log into the Job Bot extension Dashboard.");
                    } else if (response.status === 404) {
                        throw new Error("Profile not found. Please configure your settings in the Dashboard.");
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // Indicates we will respond asynchronously
    }
});

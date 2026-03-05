// Utility to inject content script manually if connection fails
function injectAndStart(tabId, action) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    }, () => {
        // Try sending message again after injecting
        chrome.tabs.sendMessage(tabId, { action: action });
    });
}

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'block';
    document.getElementById('status').style.display = 'block';
    document.getElementById('status').innerText = 'Bot is running! Keep this tab open.';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "start_applying" }, (response) => {
            if (chrome.runtime.lastError) {
                // Connection failed (content script not loaded on this tab)
                console.log("Injecting content script manually...");
                injectAndStart(tabs[0].id, "start_applying");
            }
        });
    });
});

document.getElementById('stop-btn').addEventListener('click', () => {
    document.getElementById('stop-btn').style.display = 'none';
    document.getElementById('start-btn').style.display = 'block';

    document.getElementById('start-btn').innerText = 'Resume Auto Apply';
    document.getElementById('status').innerText = 'Bot is paused.';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "stop_applying" }, (response) => {
            if (chrome.runtime.lastError) {
                console.log("Injecting content script manually...");
                injectAndStart(tabs[0].id, "stop_applying");
            }
        });
    });
});

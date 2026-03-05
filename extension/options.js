// Saves options to chrome.storage
const saveOptions = (e) => {
    e.preventDefault();

    // Convert textarea string to array of strings for blacklist
    const blacklistRaw = document.getElementById('blacklist').value;
    const blacklist = blacklistRaw.split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

    const userProfile = {
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        experience: document.getElementById('experience').value,
        currentCtc: document.getElementById('currentCtc').value,
        expectedCtc: document.getElementById('expectedCtc').value,
        noticePeriod: document.getElementById('noticePeriod').value,
        blacklist: blacklist
    };

    chrome.storage.local.set({ userProfile: userProfile }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.classList.add('show');
        setTimeout(() => {
            status.classList.remove('show');
        }, 2000);
    });
};

// Restores select box and text fields state using the preferences stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.local.get(['userProfile'], (result) => {
        if (result.userProfile) {
            document.getElementById('phone').value = result.userProfile.phone || '';
            document.getElementById('email').value = result.userProfile.email || '';
            document.getElementById('experience').value = result.userProfile.experience || '';
            document.getElementById('currentCtc').value = result.userProfile.currentCtc || '';
            document.getElementById('expectedCtc').value = result.userProfile.expectedCtc || '';
            document.getElementById('noticePeriod').value = result.userProfile.noticePeriod || '';

            // Rejoin blacklist array into a comma-separated string
            if (result.userProfile.blacklist && Array.isArray(result.userProfile.blacklist)) {
                document.getElementById('blacklist').value = result.userProfile.blacklist.join(', ');
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', saveOptions);

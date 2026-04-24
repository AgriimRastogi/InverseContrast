// The CSS to inject for inverting colors
const CSS = `
  html {
    /* Invert all content and hue-rotate to fix most colors.
      We add a white background to prevent a "blackout"
      on pages that don't define a background.
    */
    filter: invert(1) hue-rotate(180deg);
    transition: filter 0.2s ease;
    background-color: #fff; 
  }
  
  /* Un-invert ONLY images, profile pictures, etc.
    Videos will now be inverted by the 'html' rule.
  */
  img, picture {
    filter: invert(1) hue-rotate(180deg);
  }
`;

// --- Core Logic Function ---
async function toggleInversion(tab) {
  const tabId = tab.id;
  if (!tabId) return;

  // This is the target for our CSS injection.
  // We've added allFrames: true to inject into iframes (like the YouTube player).
  const target = { tabId: tabId, allFrames: true };

  // Check the current state from session storage
  const data = await chrome.storage.session.get(tabId.toString());
  const isEnabled = data[tabId] || false;

  if (isEnabled) {
    // If it's enabled, turn it off
    await chrome.scripting.removeCSS({
      target: target, // Use target with allFrames
      css: CSS
    });
    await chrome.storage.session.set({ [tabId]: false });
  } else {
    // If it's disabled, turn it on
    await chrome.scripting.insertCSS({
      target: target, // Use target with allFrames
      css: CSS
    });
    await chrome.storage.session.set({ [tabId]: true });
  }
}

// --- Event Listeners ---

// 1. Listen for the toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  toggleInversion(tab);
});

// 2. Listen for the keyboard shortcut
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "toggle-inversion") {
    toggleInversion(tab);
  }
});
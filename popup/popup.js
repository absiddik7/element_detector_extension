//popup.js
// Switch between tabs
document.addEventListener("DOMContentLoaded", function () {
  const homeTab = document.getElementById("homeTab");
  const propertiesTab = document.getElementById("propertiesTab");

  const homeContent = document.getElementById("homeContent");
  const propertiesContent = document.getElementById("propertiesContent");

  // Show the content of the active tab
  function switchTab(activeTab) {
    if (activeTab === "home") {
      homeContent.style.display = "block";
      propertiesContent.style.display = "none";
      homeTab.classList.add("active");
      propertiesTab.classList.remove("active");
    } else if (activeTab === "properties") {
      homeContent.style.display = "none";
      propertiesContent.style.display = "block";
      homeTab.classList.remove("active");
      propertiesTab.classList.add("active");
    }
  }

  // Add click events to tabs
  homeTab.addEventListener("click", () => switchTab("home"));
  propertiesTab.addEventListener("click", () => switchTab("properties"));

  // Load the default tab (Home) on page load
  switchTab("home");

  // Add event listener to the Start Inspecting button
  const startInspectingButton = document.getElementById("startInspection");

  // Check if chrome.storage is available
  const storage = chrome.storage?.local;

  if (!storage) {
    console.error(
      "chrome.storage.local is undefined. Ensure the 'storage' permission is set in manifest.json."
    );
    return;
  }

  // Load inspection state for the current tab on popup load
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    const currentTabId = tabs[0].id;
    const tabSpecificKey = `isInspecting_${currentTabId}`;

    // Fetch and update the button state when the popup loads
    chrome.storage.local.get(["isActive", tabSpecificKey], (data) => {
      const isActive = data.isActive || false;
      const isInspecting = data[tabSpecificKey] || false;

      // Synchronize states
      const syncedState = isActive ? isInspecting : false;

      // Fix any inconsistency in storage
      if (!isActive && isInspecting) {
        chrome.storage.local.set({ [tabSpecificKey]: false });
      }

      // Update the button UI
      updateButtonState(startInspectingButton, syncedState);

      console.log("Popup loaded. Current state:", {
        isActive,
        isInspecting: syncedState,
      });
    });
  });


  // Toggle inspection state
  startInspectingButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;

      const currentTabId = tabs[0].id;
      const tabSpecificKey = `isInspecting_${currentTabId}`;

      chrome.storage.local.get(tabSpecificKey, (data) => {
        const currentState = data[tabSpecificKey] || false;
        const newState = !currentState; // Toggle state

        // Update the tab-specific inspection state in storage
        chrome.storage.local.set({ [tabSpecificKey]: newState }, () => {
          // Send a message to the content script to toggle inspection
          chrome.tabs.sendMessage(
            currentTabId,
            { action: "toggle", newState },
            () => {
              if (chrome.runtime.lastError) {
                // If content script isn't injected, inject it first
                chrome.scripting.executeScript(
                  {
                    target: { tabId: currentTabId },
                    files: ["content.js"],
                  },
                  () => {
                    chrome.tabs.sendMessage(currentTabId, {
                      action: "toggle",
                      newState,
                    });
                  }
                );
              }
            }
          );

          // Update the button text and color
          updateButtonState(startInspectingButton, newState);

          // Debug print to check button state after toggle
          console.log(
            `Button clicked. New inspection state for tab ${currentTabId}:`,
            newState
          );

          // Close the popup (optional)
          window.close();
        });
      });
    });
  });

  // Listen for updates from the content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateState") {
      const { isInspecting } = message;
      updateButtonState(startInspectingButton, isInspecting);
      console.log("Received state update from content script:", isInspecting);
    }
  });

  chrome.storage.local.get(null, (data) => {
    console.log("All stored data:", data);
  });

  // Function to update the button text and color
  function updateButtonState(button, isInspecting) {
    button.textContent = isInspecting ? "Stop Inspecting" : "Start Inspecting";
    button.style.backgroundColor = isInspecting ? "#ff0000" : "#4e86ff";

    // Debug print to confirm button state visually
    console.log(
      `Button updated: text="${button.textContent}", backgroundColor="${button.style.backgroundColor}"`
    );
  }
});

// Properties tab options
document.addEventListener("DOMContentLoaded", () => {
  // List of options
  const options = ["id", "className", "name", "tagName", "XPath", "JS Path"];

  // Object to keep track of selected/unselected states
  const optionStates = options.reduce((acc, option) => {
    acc[option] = true; // All options selected by default
    return acc;
  }, {});

  // Reference to the container
  const optionsContainer = document.getElementById("optionsContainer");

  // Create buttons dynamically
  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.className = "option-btn selected"; // Default to selected style

    // Attach click event to toggle state
    button.addEventListener("click", () => {
      const isSelected = optionStates[option];

      // Update internal state
      optionStates[option] = !isSelected;

      // Update button style based on state
      if (optionStates[option]) {
        button.classList.add("selected"); // Apply selected style (blue)
        button.classList.remove("unselected");
      } else {
        button.classList.remove("selected");
        button.classList.add("unselected"); // Apply unselected style (gray)
      }
    });

    optionsContainer.appendChild(button); // Add button to DOM
  });
});

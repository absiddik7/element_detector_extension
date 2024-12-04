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
    const currentTabId = tabs[0].id;
    const tabSpecificKey = `isInspecting_${currentTabId}`;

    storage.get(tabSpecificKey, (data) => {
      const isInspecting = data[tabSpecificKey] || false;

      // Update the button text based on the inspection state
      startInspectingButton.textContent = isInspecting
        ? "Stop Inspecting"
        : "Start Inspecting";

      // Update the button color
      startInspectingButton.style.backgroundColor = isInspecting
        ? "#ff0000"
        : "#4e86ff";
    });
  });

  // Toggle inspection state
  startInspectingButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTabId = tabs[0].id;
      const tabSpecificKey = `isInspecting_${currentTabId}`;

      storage.get(tabSpecificKey, (data) => {
        const currentState = data[tabSpecificKey] || false;
        const newState = !currentState; // Toggle state

        // Update the tab-specific inspection state in storage
        storage.set({ [tabSpecificKey]: newState });

        // Send a message to the content script to toggle inspection
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" }, () => {
            if (chrome.runtime.lastError) {
              // If content script isn't injected, inject it first
              chrome.scripting.executeScript(
                {
                  target: { tabId: tabs[0].id },
                  files: ["content.js"],
                },
                () => {
                  chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
                }
              );
            }
          });
        }

        // Update the button text
        startInspectingButton.textContent = newState
          ? "Stop Inspecting"
          : "Start Inspecting";

        // Update button color
        startInspectingButton.style.backgroundColor = newState
          ? "#ff0000"
          : "#4e86ff";

        // Close the popup (optional)
        window.close();
      });
    });
  });
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

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
});

document.addEventListener("DOMContentLoaded", () => {
  // List of options
  const options = [
    "Name",
    "Fulladdress",
    "Street",
    "Municipality",
    "Categories",
    "Phone",
    "Phones",
    "Claimed",
    "Review Count",
    "Average Rating",
    "Review URL",
    "Google Maps URL",
    "Latitude",
    "Longitude",
    "Website",
    "Domain",
    "Opening hours",
    "Featured image",
    "Cid",
    "Place Id",
  ];

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

  // Example: Save button for debugging/logging selected options
  document.getElementById("saveButton").addEventListener("click", () => {
    const selectedOptions = Object.keys(optionStates).filter(
      (key) => optionStates[key]
    );
    console.log("Selected Options:", selectedOptions);
  });
});

window.onload = function () {
  const openMapBtn = document.getElementById("openMapBtn");

  // Function to check if the current tab is on Google Maps
  function checkIfOnGoogleMaps() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      const url = activeTab.url;

      // If the active tab URL includes "google.com/maps", disable the button
      if (url.includes("google.com/maps")) {
        openMapBtn.disabled = true;
        openMapBtn.innerText = "Already on Google Maps";
        openMapBtn.style.backgroundColor = "grey"; // Change button color to grey
        openMapBtn.style.color = "white"; // Optional: Change text color for better visibility
      }
    });
  }

  // Check if the user is on Google Maps when the popup loads
  checkIfOnGoogleMaps();

  // Open Google Maps in a new tab when the button is clicked
  openMapBtn.addEventListener("click", function () {
    chrome.tabs.create({
      url: "https://www.google.com/maps/search/restaurants",
    });
  });
};

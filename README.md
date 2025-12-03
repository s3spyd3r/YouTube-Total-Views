# YouTube Total Views Chrome Extension

This is a simple Chrome extension that calculates the total number of views for all videos on a YouTube channel's page.

## How it Works

The extension injects a content script into the YouTube page. When the user opens the extension's popup, the content script automatically scrolls down the page to load all the videos. As it scrolls, it finds all the view counts for each video, parses them, and adds them up. The final sum is then displayed in the extension's popup.

## Images

<p float="left">
	<img src="https://raw.githubusercontent.com/s3spyd3r/YouTube-Total-Views/refs/heads/main/Images/1.png" width="100">
	<img src="https://raw.githubusercontent.com/s3spyd3r/YouTube-Total-Views/refs/heads/main/Images/2.png" width="100">
</p>


## Features

-   Calculates the total views for all videos on a channel page.
-   Handles channels with a large number of videos by scrolling down to load them all.
-   Supports view count formats in English (K/M/B for thousands/millions/billions) and Portuguese (mil/mi).
-   The user can select the language for view count parsing.

## How to Install and Run Locally

To run this extension on your local machine, follow these steps:

1.  **Download the code**
    -   Clone this repository or download the source code as a ZIP file and extract it to a local folder.

2.  **Open Chrome's Extension Management Page**
    -   Open the Google Chrome browser.
    -   Navigate to `chrome://extensions`.

3.  **Enable Developer Mode**
    -   In the top-right corner of the Extensions page, you will see a "Developer mode" toggle. Click it to enable Developer mode.

4.  **Load the Extension**
    -   Once Developer mode is enabled, you will see a new set of buttons appear.
    -   Click on the "Load unpacked" button.
    -   A file selection dialog will open. Navigate to the folder where you saved the extension's code and select it.

5.  **Using the Extension**
    -   The "YouTube Total Views" extension should now appear in your list of extensions.
    -   Navigate to a YouTube channel's video page (e.g., `https://www.youtube.com/@Google/videos`).
    -   Click on the extension's icon in the Chrome toolbar.
    -   The popup will open and automatically start calculating the total views. Please wait as it scrolls down the page. The result will be displayed in the popup.

## Project Structure

-   `manifest.json`: The manifest file for the Chrome extension. It defines the extension's name, version, permissions, and scripts.
-   `popup.html`: The HTML file for the extension's popup window.
-   `popup.js`: The JavaScript file for the popup. It handles user interaction and communication with the content script.
-   `content.js`: The content script that is injected into YouTube pages. It contains the logic for scraping the view counts.
-   `icon16.png`, `icon48.png`, `icon128.png`: The icons for the extension.
-   `README.md`: This file, providing documentation for the project.

# YouTube Total Views Chrome Extension

A simple Chrome extension that reads the total view count from a YouTube channel's `/about` page and shows it in the popup.

<p float="left">
	<img src="https://raw.githubusercontent.com/s3spyd3r/YouTube-Total-Views/refs/heads/main/Images/1.png" width="300">
	<img src="https://raw.githubusercontent.com/s3spyd3r/YouTube-Total-Views/refs/heads/main/Images/2.png" width="300">
</p>

## How it Works

Type a channel handle in the popup (e.g. `s3spyd3r`), click Refresh. The extension opens the channel's `/about` page in a hidden window, reads the total view count from YouTube's internal API, and displays it. The handle is remembered between sessions.

## Features

- Reads the **total view count** directly from YouTube's internal API.
- Works on any channel handle format: `@handle`, `channel/UC...`, `c/name`, `user/name`.
- **Multi-language**: automatically picks up whatever language YouTube is showing (English, Portuguese, Spanish, French, Italian).
- **Persisted handle**: the last channel you queried is remembered and pre-filled next time.
- The work happens in a hidden window — your tab strip is never touched.

## How to Install and Run Locally

1. **Download the code**
   - Clone this repository or download the source code as a ZIP file and extract it to a local folder.

2. **Open Chrome's Extension Management Page**
   - Open Google Chrome.
   - Navigate to `chrome://extensions`.

3. **Enable Developer Mode**
   - In the top-right corner of the Extensions page, toggle "Developer mode" on.

4. **Load the Extension**
   - Click the "Load unpacked" button.
   - Select the folder where you saved the extension's code.

5. **Use the Extension**
   - Click the extension's icon in the Chrome toolbar.
   - Type a channel handle and click **Refresh**.

## Project Structure

- `manifest.json`: The manifest file. Permissions: `activeTab`, `scripting`, `storage`.
- `popup.html`: The HTML for the popup window.
- `popup.js`: JavaScript for the popup. Handles input, opens the hidden window, persists the channel.
- `content.js`: Content script injected into YouTube pages. Reads the view count.
- `icon16.png`, `icon48.png`, `icon128.png`: Icons.
- `README.md`: This file.
- `AGENTS.md`: Developer documentation.

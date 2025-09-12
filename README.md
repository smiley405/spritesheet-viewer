# Spritesheet Viewer for Grafx2

This was made while I was participating in the js13kGames 2025 game jam.

I mainly create all my art and animations using GrafX2. GrafX2 is really great for pixel art—it's like Vim for pixel artists. It has saved me a lot of time.

However, the downside is that it lacks proper animation tools, like the timeline feature you see in Aseprite or Flash. It does have its own animation setup, but it's not ideal for editing complex or heavy sprites.

So, to fill that gap, I wrote this tool.

<img src="sample/sample_vid.gif">

**Features::**
<br>[1] Edit your sprites in GrafX2, select the frames, and preview the animation live in this tool.
<br>[2] Drag and drop the image, or upload it via the menu.
<br>[3] When you edit and save the image in GrafX2, it automatically updates in the spritesheet viewer. It remembers all the changes you make in GrafX2 and updates them live.
<br>[4] Export the selected frames as PNG sequences, GIFs, or a spritesheet.
<br>[5] Select frames by setting the desired grid dimensions and play the animation.
<br>[6] And more...

**How to use::**:
<br> Clone this repository and run: npm run dev
<br> This was made during a game jam, so there may still be some minor bugs and cleanup needed. Pull requests are more than welcome!

**Help Page::**
<br> - To upload a file, drag and drop it into the viewport or go to Menu → Upload.
<br> - After creating the grid, press Ctrl + Left Click to select or deselect a grid frame, or Shift + Left Click to create a rectangular selection.
<br> - Use the mouse wheel to zoom in or out of the preview and viewport windows. 
<br> - Click and drag with the left mouse button to pan the preview and viewport windows.
<br> - FFmpeg installation is required to export GIFs.
<br> - Go to Menu → Remember to re-apply the current settings to the next uploaded file.
<br> - Press the Spacebar to play or pause.
<br>
<br> - There are three ways to navigate selected frames:
<br> 1) Click on an individual frame from the frame collection.
<br> 2) Press the "Z" key and Left Click on frames in the viewport.
<br> 3) Use the Left Arrow key to move to the previous frame, and the Right Arrow key to move to the next frame.

**Dependencies Used Internally::**
<br> [Electron](https://github.com/electron/electron)
<br> [tweakpane](https://github.com/cocopon/tweakpane) used for the menu 
<br> [panzoom](https://github.com/timmywil/panzoom) used for dragging and panning the viewport
<br> Requires [FFmpeg](https://github.com/FFmpeg/FFmpeg) to be installed manually for exporting GIFs and spritesheets


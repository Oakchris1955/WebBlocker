# WebBlocker

WebBlocker is a Chrome extension written in TypeScript to block certain websites

## Installation

1) Install `Node.js` framework, which will provide us a package manager know us `npm`
2) Clone the repository using `git` or by clicking the green button saying "Code" (don't forget unzipping it)
3) Open the console and install dependencies by typing `npm install` on the workspace folder
4) Compile the `.ts` files by typing `tsc` on a new terminal. This will re-compile the files on every file save. To disable this feature, comment out the `watch` field on `tsconfig.json`
5) Lastly, open a Chromium-based browser and go to `chrome://extensions`. Enable developer mode, click on `Load unpacked` and select the workspace folder
6) You are done. You can now run the extension (and modify it if you want)

## Contributing

(Note: It is recommended to have the `watch` property on `tsconfig.json` set to `true`)

If you have the extension installed, run `tsc` on a spare terminal and the files will automatically recompile upon change. If you have made any non-HTML-related changes (a HTML change here is thought a change on a (`.html`, `.css` or `.ts`/`.js` file), it is recommended to reload the extension using the corresponding reload button

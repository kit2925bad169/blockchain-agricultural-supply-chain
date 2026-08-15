# Run the project and make QR scanning work

1. Open this folder in VS Code (the folder containing `package.json`).
2. Run:
   `npm install`
3. Start Vite on your network:
   `npm run dev -- --host`
4. VS Code/Vite will show a Network URL such as:
   `http://192.168.x.x:5173/`
5. Open the **Network URL** on the computer and keep the computer and phone on the same Wi-Fi.
6. Register a crop. The generated QR now contains the full trace URL (`/?track=...`).
7. Scan the QR with Google Lens or the phone camera. It should open the Consumer Trace page and load the crop automatically.

Important: if the site is opened as `http://localhost:5173`, a phone cannot resolve `localhost` to your computer. Use the Network URL for QR testing.

For a real public QR that works from any network, deploy the Vite site to a public HTTPS URL and generate the QR from that deployed URL.

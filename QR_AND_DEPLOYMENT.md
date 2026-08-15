# AgriTrust QR / Google Lens setup

This is one complete project.

## Local testing on a phone

1. Connect the phone and laptop to the same Wi-Fi.
2. Run:
   `npm.cmd run dev -- --host 0.0.0.0`
3. Copy the Vite `Network:` URL, for example `http://10.217.155.167:5173`.
4. Put that URL in `.env`:
   `VITE_PUBLIC_APP_URL=http://10.217.155.167:5173`
5. Restart Vite.
6. Register a NEW crop so a NEW QR code is generated.
7. Scan the new QR with Google Lens.

## Public / hackathon use

For a QR that works from any phone/network, deploy the project to a public HTTPS host such as Vercel and set:

`VITE_PUBLIC_APP_URL=https://YOUR-PUBLIC-DOMAIN`

Then rebuild/redeploy and generate NEW QR codes.

The QR opens the root page with `?track=...`; `App.tsx` automatically selects the Consumer dashboard and loads the matching product and supply-chain events.

## Demo Farmer ID

`AGRI-DEMO-FARMER-001` is intentionally a hackathon demo identifier. It is not a real government-issued AgriStack ID.

## Important

The project no longer inserts `farmer_id` into the `products` table, because the current Supabase schema did not contain that column. The demo ID is shown in the UI and included in the initial harvest event notes.

## Farmer AgriStack Demo Login

The farmer entry now includes an **AgriStack Farmer Login** screen for the hackathon demo.

- Demo ID: `AGRI-DEMO-FARMER-001`
- The demo ID is displayed below the login field.
- The field is intentionally **not auto-filled**; type the demo ID manually during the demo.
- This is a hackathon demonstration login and does not perform official AgriStack authentication.

# Getting started

## Run the tracker

Install Node.js 24 or newer with npm, then run these commands from the repository root.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. A fresh browser profile starts in **Neverwinter** at **08:00 on 1 Tarsakh 1491 DR**, with **Year of the Scarlet Witch** underneath. The last saved time and location resume in the same browser profile at the same site address. When running Vite locally, keep the same host and port between sessions.

## Preview the production build

```sh
npm run build
npm run preview
```

Open the preview URL printed by Vite. The production build runs as a static site. Use the same preview URL and browser profile to resume its saved campaign.

The production build was verified in Chrome and Edge on Windows at viewport widths of 320, 390, 1280, and 1440 pixels. The checks covered keyboard controls, reload, and closing and reopening the browser.

## Run a mock session

Use a separate, regular browser profile to start a fresh campaign and test the save.

1. Confirm the clock starts at **08:00 on 1 Tarsakh 1491 DR** in **Neverwinter**.
2. Use **+1 day** and **+8 hours** for travel. Select **Phandalin** and check that the clock still reads **16:00 on 2 Tarsakh**. The daylight readout should show Phandalin.
3. Use **+4 hours** and **+2 hours** to reach **22:00 on 2 Tarsakh**. Use **+8 hours** for an overnight rest. The clock should reach **06:00 on 3 Tarsakh**.
4. Open **Set Current Time**, change the time to **05:30**, and choose **Set Time**. Use **+10 days** to reach **05:30 on 13 Tarsakh** in Phandalin.
5. Click **Campaign summary** to select the full line, or focus the field and use Select All. Check that it shows **Hour 5** with the phase and weather from the clock.
6. Reload, then close and reopen the tracker at the same address. Confirm the clock, location, weather, and summary all match the end of the session.

For a festival check, set the clock to **23:00 on 30 Tarsakh 1491 DR** and use **+1 hour** to reach **00:00 on Greengrass**. **+1 day** reaches **00:00 on 1 Mirtul**. You can also enter festivals directly from **Month or festival**.

Use Tab to reach **Set Current Time**, Enter to open it, and Escape to close it. Focus the current location and use the arrow keys to switch locations. Run `npm test` for the calendar, daylight, weather, and summary checks independently of the browser.

## Troubleshooting

- If npm is missing or reports an engine mismatch, install Node.js 24 or newer and check `node --version` and `npm --version`.
- If `npm ci` cannot reach the package registry, check the connection or the configured npm registry, then retry the install.
- If the page is blank after opening `index.html` directly, open the URL printed by `npm run dev` instead. Vite serves the TypeScript entry point.
- If the clock reports a save failure, browser storage may be blocked. The updated time is still available in the current tab.

See [Development](development.md) for the local workflow and the [roadmap](../roadmap/roadmap.json) for release status.

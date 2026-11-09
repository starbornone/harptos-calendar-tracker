# Getting started

## Run the tracker

Install Node.js 24 or newer with npm, then run these commands from the repository root.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. A fresh browser profile starts in **Neverwinter** at **08:00 on 1 Tarsakh 1491 DR**, with **Year of the Scarlet Witch** underneath. The last saved time and location resume in the same browser profile at the same site address. When running Vite locally, keep the same host and port between sessions.

## Try the first calendar check

Open **Set Current Time**, choose **Tarsakh**, and enter day **30**, year **1491**, and **23:00**. Click **Set Time** and then **+1 hour**. The clock should reach **00:00 on Greengrass**. Click **+1 day** to reach **00:00 on 1 Mirtul**, then reload to check that the time was saved. For direct entry of a festival, choose it from **Month or festival**.

Under **Campaign location**, select **Phandalin**. The clock should still read **00:00 on 1 Mirtul**. Reload to check that both the time and Phandalin were saved.

Click the **Campaign summary** field to select its full line, or focus the field and use Select All. Copy it into your session notes. It reflects the current phase and weather for the selected location.

Run `npm test` to verify the calendar arithmetic independently of the browser.

## Troubleshooting

- If npm is missing or reports an engine mismatch, install Node.js 24 or newer and check `node --version` and `npm --version`.
- If `npm ci` cannot reach the package registry, check the connection or the configured npm registry, then retry the install.
- If the page is blank after opening `index.html` directly, open the URL printed by `npm run dev` instead. Vite serves the TypeScript entry point.
- If the clock reports a save failure, browser storage may be blocked. The updated time is still available in the current tab.

See [Development](development.md) for build and preview commands or the [active roadmap](../roadmap/roadmap.json) for upcoming features.

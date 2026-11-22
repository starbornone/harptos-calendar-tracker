import { translate, type Locale } from "@/localization.ts";

const companions = [
  { name: "Chronicler", href: "https://www.chronicler.studio/", description: "companions.chronicler" },
  { name: "D&D Point-Buy Calculator", href: "https://dnd.astralarchives.games/", description: "companions.dnd" },
  { name: "World Binder", href: "https://www.worldbinder.app/", description: "companions.worldBinder" },
  { name: "Open Tome", href: "https://www.opentome.world/", description: "companions.openTome" },
  { name: "Pathfinder 2e Calculator", href: "https://pf.astralarchives.games/", description: "companions.pathfinder" },
] as const;

const companionIcons = [
  "M12 7C9 5 6 5 3 6v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1V7Z",
  "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h.01M12 12h.01M17 17h.01",
  "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15",
  "M3 3h18v18H3V3Zm6 0v18m6-18v18M3 9h18M3 15h18",
  "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h.01M12 12h.01M17 17h.01",
];

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="ledger ledger-footer">
      <nav className="companion-tools" aria-labelledby="companions-heading">
        <div className="companion-heading">
          <h2 id="companions-heading">{translate(locale, "companions.heading")}</h2>
          <p>{translate(locale, "companions.intro")}</p>
        </div>
        <ul className="companion-links">
          {companions.map(({ name, href, description }, index) => (
            <li key={href}>
              <a href={href}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={companionIcons[index]} />
                </svg>
                <span>
                  <strong>{name}</strong>
                  <small>{translate(locale, description)}</small>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="footer-links" aria-label={translate(locale, "footer.links")}>
        <a href="https://www.astralarchives.games/">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5m6 6-6-6 6-6" />
          </svg>
          {translate(locale, "footer.home")}
        </a>
        <div className="footer-secondary-links">
          <a href="https://ko-fi.com/starbornone" target="_blank" rel="noopener noreferrer">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Zm13 1h1a3 3 0 0 1 0 6h-1M3 22h16M8 3v3m5-3v3" />
            </svg>
            {translate(locale, "footer.support")}
          </a>
          <a href="https://github.com/starbornone/harptos-calendar-tracker" target="_blank" rel="noopener noreferrer">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>
      <p className="footer-intro">{translate(locale, "footer.intro")}</p>
      <p className="footer-disclaimer" lang={locale}>
        {translate(locale, "footer.disclaimer")}
      </p>
    </footer>
  );
}

import { translate, type Locale } from "@/localization.ts";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="ledger ledger-footer">
      <nav className="footer-links" aria-label={translate(locale, "Site links")}>
        <a href="https://www.starmist.studio/">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5m6 6-6-6 6-6" />
          </svg>
          {translate(locale, "Return to Starmist Studio")}
        </a>
        <div className="footer-secondary-links">
          <a href="https://ko-fi.com/starbornone" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Zm13 1h1a3 3 0 0 1 0 6h-1M3 22h16M8 3v3m5-3v3" />
            </svg>
            {translate(locale, "Support on Ko-fi")}
          </a>
          <a href="https://github.com/starbornone/harptos-calendar-tracker" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>
      <p className="footer-intro">
        {translate(locale, "Track campaign time, seasonal daylight, and hourly weather for Dungeons & Dragons adventures in the Forgotten Realms.")}
      </p>
      <p className="footer-disclaimer" lang={locale}>
        {translate(locale, "Not affiliated with Wizards of the Coast.")}
      </p>
    </footer>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" width="39" height="39" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  );
}

function BuyMeACoffeeMark() {
  return (
    <svg viewBox="0 0 24 24" width="39" height="39" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 5.5h12.5v2H19a3.5 3.5 0 0 1 0 7h-1.68A6.5 6.5 0 0 1 5 12V5.5Zm12.5 4V12c0 .17-.01.34-.02.5H19a1.5 1.5 0 0 0 0-3h-1.5ZM7 7.5V12a4.5 4.5 0 0 0 9 0V7.5H7Zm-1 10h12a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2ZM9 1.5a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function FooterLink({ children, href, label, title = label }) {
  return (
    <a
      className="footer-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={title}
    >
      {children}
    </a>
  );
}

export function FooterLinks() {
  return (
    <div className="footer-links">
      <FooterLink href="https://buymeacoffee.com/dobaksz" label="Buy me a coffee">
        <BuyMeACoffeeMark />
      </FooterLink>
      <FooterLink
        href="https://github.com/dobaksz/drum-pattern-editor"
        label="View this project on GitHub"
        title="View on GitHub"
      >
        <GitHubMark />
      </FooterLink>
    </div>
  );
}

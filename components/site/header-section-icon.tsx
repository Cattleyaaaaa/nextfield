type HeaderSectionIconProps = { href: string };

/** Paired motifs keep the main navigation legible at its compact size. */
export function HeaderSectionIcon({ href }: HeaderSectionIconProps) {
  if (!["/about", "/projects", "/blog", "/gallery/radio"].includes(href)) return null;

  return (
    <svg
      aria-hidden="true"
      className="site-header-composite-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 20 20"
    >
      {href === "/about" && (
        <>
          <circle cx="7.5" cy="6.2" r="2.2" />
          <path d="M3.4 15.7c.5-2.8 1.9-4.1 4.1-4.1s3.6 1.3 4.1 4.1" />
          <path className="text-accent" d="M15.3 3v5.2m-2.6-2.6h5.2" />
        </>
      )}
      {href === "/projects" && (
        <>
          <path d="m3.1 6 6-3.2 6 3.2-6 3.2zM3.1 9.7l6 3.2 6-3.2" />
          <path className="text-accent" d="m3.1 13.3 6 3.2 6-3.2" />
        </>
      )}
      {href === "/blog" && (
        <>
          <path d="M2.7 4.7c2.2-.4 4.3 0 6.3 1.3v9.1c-2-1.2-4.1-1.6-6.3-1.2zM9 6c2-1.3 4.1-1.7 6.3-1.3v5.2" />
          <path className="text-accent" d="m12.5 14.3 4.4-4.4 1.2 1.2-4.4 4.4-1.9.7z" />
        </>
      )}
      {href === "/gallery/radio" && (
        <>
          <circle cx="8.8" cy="10" r="6.2" />
          <circle cx="8.8" cy="10" r="1.6" />
          <path className="text-accent" d="M16 6.6c1.1.8 1.7 2 1.7 3.4s-.6 2.6-1.7 3.4" />
        </>
      )}
    </svg>
  );
}

import { logout } from "@/app/admin/actions";

export function Shell({
  title,
  active,
  children,
}: {
  title: string;
  active: "overview" | "settings";
  children: React.ReactNode;
}) {
  const tab = (href: string, label: string, key: string) => (
    <a
      href={href}
      className={
        "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors " +
        (active === key ? "bg-ink text-white" : "text-ink-2 hover:text-ink")
      }
    >
      {label}
    </a>
  );

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-hairline/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-2">
            {tab("/admin", "Übersicht", "overview")}
            {tab("/admin/settings", "Einstellungen", "settings")}
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <a href="/" className="text-ink-2 transition-colors hover:text-ink">
              Seite ansehen ↗
            </a>
            <form action={logout}>
              <button type="submit" className="text-ink-2 transition-colors hover:text-ink">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
        {children}
      </main>
    </>
  );
}

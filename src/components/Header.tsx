import { Button } from "@/components/ui/button";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs: Breadcrumb[];
}

export default function Header({ breadcrumbs }: HeaderProps) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/login";
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="flex items-center justify-between py-6">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.label}>
              {index > 0 && <span className="mx-2">/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                  aria-label={index === 0 ? "Home" : `Back to ${crumb.label.toLowerCase()}`}
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground font-medium" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <Button variant="outline" onClick={handleLogout} className="text-sm" aria-label="Log out of your account">
        Logout
      </Button>
    </header>
  );
}

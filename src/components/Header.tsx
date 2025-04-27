import { Button } from "@/components/ui/button";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs: Breadcrumb[];
  user?: { email: string } | null;
}

export default function Header({ breadcrumbs, user }: HeaderProps) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/auth/login";
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
      <div className="flex items-center gap-4">
        {user?.email && (
          <span className="text-sm text-muted-foreground" data-testid="user-email">
            {user.email}
          </span>
        )}
        {user ? (
          <Button variant="outline" onClick={handleLogout} className="text-sm" aria-label="Log out of your account">
            Logout
          </Button>
        ) : (
          <Button variant="outline" className="text-sm" aria-label="Log in to your account" asChild>
            <a href="/auth/login">Login</a>
          </Button>
        )}
      </div>
    </header>
  );
}

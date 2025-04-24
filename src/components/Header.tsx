import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center justify-between py-6">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
          </li>
          <li>/</li>
          <li>
            <span className="text-foreground" aria-current="page">
              {title}
            </span>
          </li>
        </ol>
      </nav>
      <Button
        variant="outline"
        onClick={async () => {
          // Will implement logout functionality later
          window.location.href = "/";
        }}
      >
        Logout
      </Button>
    </header>
  );
}

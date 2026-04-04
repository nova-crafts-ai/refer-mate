import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Benefits", href: "#benefits" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border py-3"
          : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between relative">
        <a href="#" className="flex items-center gap-3">
          <div className="h-10 max-h-10 pt-1.5 mb-1.5 overflow-hidden">
            <img className="h-full w-auto" src="/refer-mate-square.png" />
          </div>
          <div className="h-10 max-h-10 overflow-hidden p-1 mb-1.5">
            <img className="h-full w-auto" src="/refer-mate-full.png" />
          </div>
        </a>

        {/* Desktop Navigation
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav> */}

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full border-border hover:bg-muted/50 font-medium"
            asChild
          >
            <a href={import.meta.env.VITE_APP_URL + "/login"}>Sign In</a>
          </Button>
          <Button
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium"
            asChild
          >
            <a href={import.meta.env.VITE_APP_URL + "/signup"}>Get Started</a>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium p-2 hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="outline"
              className="w-full rounded-full border-border hover:bg-muted/50 font-medium"
              asChild
            >
              <a href={import.meta.env.VITE_APP_URL + "/login"}>Sign In</a>
            </Button>
            <Button
              className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium"
              asChild
            >
              <a href={import.meta.env.VITE_APP_URL + "/signup"}>Get Started</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

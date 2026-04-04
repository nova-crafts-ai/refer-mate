import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import DashboardImg from "@/assets/images/dashboard.png"

export default function Demo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section className="pt-10 pb-20 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={containerRef}
          className={cn(
            "transition-all duration-1000 ease-out transform will-change-transform",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
        >
          <div className="relative mx-auto max-w-6xl rounded-xl border border-border bg-background shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            <div className="absolute top-0 flex w-full items-center gap-2 bg-muted/30 px-4 py-3 border-b border-border">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <div className="ml-4 flex-1 max-w-lg">
                <div className="h-6 w-full rounded-md bg-background border border-border/50 text-[10px] flex items-center px-2 text-muted-foreground">
                  outreach.so/dashboard
                </div>
              </div>
            </div>

            <div className="aspect-[16/10] w-full bg-background flex items-center justify-center p-1 pt-12">
              <div className="relative w-full h-full group">
                <img
                  src={DashboardImg}
                  alt="Dashboard Preview"
                  className="w-full h-full object-contain shadow-sm transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 opacity-40 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-lg pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { ROUTES } from "@/lib/consts/routesConsts";

interface FullLogoProps {
  to?: string;
  className?: string;
}

const FullLogo = ({ to, className }: FullLogoProps) => {
  if (!to) {
    return (
      <div
        className={cn("flex items-center gap-3 font-bold text-xl", className)}
      >
        <div className="h-10 max-h-10 pt-1.5 mb-1.5 overflow-hidden">
          <img className="h-full w-auto" src="/refer-mate-square.png" />
        </div>
        <div className="h-10 max-h-10 overflow-hidden p-1 mb-1.5">
          <img className="h-full w-auto" src="/refer-mate-full.png" />
        </div>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn("flex items-center gap-3 font-bold text-xl", className)}
    >
      <div className="h-10 max-h-10 pt-1.5 mb-1.5 overflow-hidden">
        <img className="h-full w-auto" src="/refer-mate-square.png" />
      </div>
      <div className="h-10 max-h-10 overflow-hidden p-1 mb-1.5">
        <img className="h-full w-auto" src="/refer-mate-full.png" />
      </div>
    </Link>
  );
};

export default FullLogo;

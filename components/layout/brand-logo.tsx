import Link from "next/link";
import { Car } from "lucide-react";
import { env } from "@/lib/env";

export function BrandLogo() {
  const appName = env.NEXT_PUBLIC_APP_NAME || "Ridely";

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-700 transition-colors">
        <Car className="w-5 h-5" />
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
        {appName}
      </span>
    </Link>
  );
}


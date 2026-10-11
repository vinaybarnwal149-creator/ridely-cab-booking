import Link from "next/link";
import { env } from "@/lib/env";

export function Footer() {
  const appName = env.NEXT_PUBLIC_APP_NAME || "Ridely";

  return (
    <footer className="bg-[#000000] text-[#ffffff] border-t border-[#333333] mt-auto py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#ffffff] mb-2">{appName}</div>
            <Link href="/help" className="text-sm text-[#ffffff] hover:underline">
              Visit Help Center &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-medium text-[#ffffff] mb-3">Company</h4>
              <ul className="space-y-2 text-[#afafaf] text-xs">
                <li><Link href="/how-it-works" className="hover:text-[#ffffff]">About us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[#ffffff]">Our offerings</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[#ffffff]">Newsroom</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-[#ffffff] mb-3">Products</h4>
              <ul className="space-y-2 text-[#afafaf] text-xs">
                <li><Link href="/book" className="hover:text-[#ffffff]">Ride</Link></li>
                <li><Link href="/driver/onboarding" className="hover:text-[#ffffff]">Drive</Link></li>
                <li><Link href="/book" className="hover:text-[#ffffff]">Deliver</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-[#ffffff] mb-3">Global Citizenship</h4>
              <ul className="space-y-2 text-[#afafaf] text-xs">
                <li><Link href="/help" className="hover:text-[#ffffff]">Safety</Link></li>
                <li><Link href="/terms" className="hover:text-[#ffffff]">Diversity</Link></li>
                <li><Link href="/privacy" className="hover:text-[#ffffff]">Transparency</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-[#ffffff] mb-3">Legal</h4>
              <ul className="space-y-2 text-[#afafaf] text-xs">
                <li><Link href="/terms" className="hover:text-[#ffffff]">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-[#ffffff]">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#333333] flex flex-col sm:flex-row justify-between items-center text-xs text-[#767676]">
          <p>&copy; 2026 {appName} Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span>Privacy</span>
            <span>Accessibility</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

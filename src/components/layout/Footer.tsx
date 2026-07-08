import Link from "next/link";
import { Cpu, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full relative overflow-hidden mt-auto">
      {/* Glowing Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-primary blur-[2px] opacity-50" />
      
      {/* Background with slight glow */}
      <div className="absolute inset-0 bg-[#050505] -z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/40 blur-[10px] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Cpu className="h-7 w-7 text-primary relative z-10" />
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight flex items-center">
                <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">AI</span>
                <span className="ml-1 text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">Engine</span>
              </span>
            </Link>
            <p className="text-subtitle text-zinc-400 text-sm max-w-md leading-relaxed mb-8">
              The ultimate destination for discovering and comparing high-performance AI hardware. From powerful GPUs to next-gen NPUs, find the perfect engine for your artificial intelligence workflows.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-none bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-primary/20 hover:border-primary/50 transition-all duration-300">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-none bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-primary/20 hover:border-primary/50 transition-all duration-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.150h-1.91z" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-none bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-primary/20 hover:border-primary/50 transition-all duration-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">Categories</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              {[
                { name: "AI GPUs", href: "/category/gpus" },
                { name: "AI Laptops", href: "/category/laptops" },
                { name: "NPU Processors", href: "/category/npus" },
                { name: "Workstations", href: "/category/workstations" },
                { name: "Compare Hardware", href: "/compare" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="relative group inline-block hover:text-white transition-colors"
                  >
                    <span className="relative z-10">{link.name}</span>
                    <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              {[
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "/cookies" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="relative group inline-block hover:text-white transition-colors"
                  >
                    <span className="relative z-10">{link.name}</span>
                    <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Affiliate Disclaimer & Copyright */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-subtitle text-[11px] text-zinc-500 max-w-2xl text-center md:text-left leading-relaxed">
            AI Engine is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
          <p className="text-subtitle text-sm text-zinc-500 whitespace-nowrap">
            &copy; {new Date().getFullYear()} AI Engine. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

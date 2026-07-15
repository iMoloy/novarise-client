import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070913]/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Branding */}
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-[5px] bg-[#070913]">
              <Image src="/icon.svg" alt="Logo" width={12} height={12} className="w-3 h-3" />
            </div>
          </div>
          <span className="text-sm font-black tracking-widest text-white">
            NOVA<span className="text-cyan-400 font-extrabold">RISE</span>
          </span>
        </div>

        {/* Info */}
        <p className="text-[10px] text-slate-500 font-medium">
          © {new Date().getFullYear()} NovaRise Crowdfunding. Developed under strict assignment specifications.
        </p>

        {/* Links */}
        <div className="flex gap-6 text-[10px] font-bold text-slate-400">
          <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a>
        </div>

      </div>
    </footer>
  );
}

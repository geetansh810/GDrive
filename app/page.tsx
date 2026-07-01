import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { ArrowRight, CloudLightning, ShieldCheck, Share2, Bot, HardDrive, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#04050C] text-white selection:bg-brand-100 selection:text-white relative">
      {/* Background Glows Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#1FA5FF]/20 to-[#47B6FF]/5 blur-[120px] will-change-transform" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#fd366e]/10 to-[#ee0a5e]/5 blur-[150px] will-change-transform" />
      </div>
      
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/brand-logos/vector/default-monochrome.svg"
            alt="ByteBox Logo"
            width={140}
            height={45}
            className="h-auto w-[120px] md:w-[140px] filter brightness-125"
          />
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/85">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#telegram" className="hover:text-white transition-colors">Bot Integration</a>
          <a href="#stats" className="hover:text-white transition-colors">Stats</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-brand-100 transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/sign-up" className="bg-brand hover:bg-brand-100 transition-all duration-300 text-white font-semibold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 group">
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-28 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 text-xs md:text-sm font-medium text-brand-100 backdrop-blur-md">
          <Bot size={16} />
          Powered by Telegram & MongoDB
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
          Secure Cloud Storage <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-brand to-brand-100 bg-clip-text text-transparent">Connected via Telegram</span>
        </h1>
        
        <p className="mt-8 text-base md:text-xl text-white/80 max-w-3xl leading-relaxed">
          Upload, preview, organize, and share documents, videos, images, and audio seamlessly. ByteBox integrates directly with your Telegram bot infrastructure for high-speed uploads and secure data delivery.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/sign-up" className="w-full sm:w-auto bg-brand hover:bg-brand-100 transition-all duration-300 text-white font-bold px-8 py-4 rounded-full text-base flex items-center justify-center gap-2 group shadow-lg shadow-brand/20">
            Start Free Storage
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/sign-in" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 px-8 py-4 rounded-full text-base font-semibold text-white flex items-center justify-center backdrop-blur-md">
            Access Dashboard
          </Link>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md shadow-2xl relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand to-brand-100 opacity-20 blur-md pointer-events-none" />
          <div className="rounded-xl overflow-hidden bg-[#0A0C14] border border-white/5 relative aspect-[16/9] flex items-center justify-center">
            <Image
              src="/assets/images/uploadImage.svg"
              alt="ByteBox Dashboard Overview"
              fill
              className="object-contain p-8 md:p-12 opacity-80"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-white/5 bg-white/[0.01] relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold">Next-Gen Storage Management</h2>
            <p className="mt-4 text-white/70 text-lg">
              Packed with modern utilities designed to handle files of all formats with speed and elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Telegram Sync</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Connect your account with your personal bot in seconds. Send files to the bot and watch them sync live onto your browser dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Eye size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast In-App Previews</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Instantly view images, stream videos, or read PDF documents directly from the app interface using secure URL redirection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Collaborative Sharing</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Share documents securely with teammates via their email. Control file access parameters and keep transaction histories tidy.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HardDrive size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Categorized Dashboard</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                A clean structure automatically separates documents, images, video, audio, and other file types, displaying dynamic analytics of your storage.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Password Login</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Log in securely with encrypted password authentication protecting your files against unauthorized access.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CloudLightning size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Optimized CDN Delivery</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Leverages global Telegram CDN edge servers to retrieve and deliver files rapidly, giving you sub-second downloads worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Telegram CTA Callout */}
      <section id="telegram" className="py-24 border-t border-white/5 relative z-10 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-brand/10 via-brand-100/5 to-transparent border border-white/10 rounded-[30px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-4">
                <Bot size={18} />
                Instant Access
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Sync directly using Telegram</h2>
              <p className="mt-4 text-light-200/70 text-base md:text-lg leading-relaxed">
                Start a conversation with our bot inside your Telegram app, type `/start` with your username, and immediately gain the ability to push data straight from chat into your dashboard.
              </p>
            </div>
            <div>
              <Link href="/sign-up" className="whitespace-nowrap bg-brand hover:bg-brand-100 transition-all duration-300 text-white font-bold px-8 py-4 rounded-full text-base flex items-center gap-2 group">
                Try Bot Connection
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 border-t border-white/5 bg-white/[0.005] relative z-10">
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-brand to-brand-100 bg-clip-text text-transparent">2 GB</div>
            <p className="mt-2 text-white/60 font-medium uppercase tracking-wider text-xs md:text-sm">Free Cloud Storage</p>
          </div>
          <div>
            <div className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-brand to-brand-100 bg-clip-text text-transparent">50 MB</div>
            <p className="mt-2 text-white/60 font-medium uppercase tracking-wider text-xs md:text-sm">Single Upload Limit</p>
          </div>
          <div>
            <div className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-brand to-brand-100 bg-clip-text text-transparent">99.9%</div>
            <p className="mt-2 text-white/60 font-medium uppercase tracking-wider text-xs md:text-sm">Uptime Reliability</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-[#030409]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/60">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/brand-logos/vector/default-monochrome.svg"
              alt="ByteBox Logo"
              width={100}
              height={32}
              className="h-auto w-[90px] filter brightness-125 opacity-70"
            />
          </div>
          <p>© {new Date().getFullYear()} ByteBox. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

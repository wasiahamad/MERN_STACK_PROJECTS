import { Link } from "wouter";
import { Video, ArrowRight, Shield, Sparkles, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Video className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl">ZoomClone</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
            <a href="#footer" className="hover:text-foreground transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth">
              <a className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                Sign in
              </a>
            </Link>
            <Link href="/auth">
              <a className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors text-sm font-semibold flex items-center gap-2">
                Start for free
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-6">
                <span className="w-2 h-2 rounded-full bg-primary" />
                ZoomClone is now live
              </div>
              <h1 className="text-5xl sm:text-6xl font-display font-bold leading-tight">
                Video calls that feel
                <span className="block bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  like being there.
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                Crystal-clear audio, HD video, instant screen sharing, and realtime chat — built for modern teams.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <a className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                    Start for free
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-semibold transition-colors flex items-center justify-center">
                    Sign in
                  </a>
                </Link>
              </div>

              <div id="features" className="mt-12 grid sm:grid-cols-3 gap-4">
                <Feature icon={<Users className="w-5 h-5" />} title="Team-ready" desc="Join by link, code, or schedule." />
                <Feature icon={<Sparkles className="w-5 h-5" />} title="Modern UX" desc="Smooth UI, fast, responsive." />
                <Feature icon={<Shield className="w-5 h-5" />} title="Secure" desc="JWT auth + protected APIs." />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 to-purple-600/20 blur-[80px] rounded-full" />
              <div className="relative glass rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Live meeting preview</div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">
                    HD • Low latency
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="aspect-video rounded-2xl bg-secondary border border-white/10" />
                  <div className="aspect-video rounded-2xl bg-secondary border border-white/10" />
                  <div className="aspect-video rounded-2xl bg-secondary border border-white/10" />
                  <div className="aspect-video rounded-2xl bg-secondary border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="py-16">
          <div className="glass rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold">Built with security in mind</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Authenticated APIs, protected meeting actions, and realtime signaling over Socket.IO.
            </p>
          </div>
        </section>
      </main>

      <footer id="footer" className="border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold">ZoomClone</div>
              <div className="text-sm text-muted-foreground">Modern video meetings.</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ZoomClone • Built with MERN + WebRTC
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
      <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}

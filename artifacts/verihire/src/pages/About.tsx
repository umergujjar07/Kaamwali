import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck, Users, Star, MapPin, Clock, Heart, Award,
  CheckCircle2, Phone, Mail, Globe, Zap, BadgeCheck,
  ChefHat, Car, Sparkles, Shield, Baby, Flower2, ArrowRight,
} from "lucide-react";
import kwLogo from "@/assets/kw-logo.png";
import kwBanner from "@/assets/kw-banner.jpg";

/* ── Scroll-reveal ───────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("sr-visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.10, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".sr").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ── Animated counter ────────────────────────────────────────────── */
function Counter({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      let v = 0; const step = Math.ceil(to / 55);
      const id = setInterval(() => { v = Math.min(v + step, to); setN(v); if (v >= to) clearInterval(id); }, 22);
    }, { threshold: 0.5 });
    obs.observe(el); return () => obs.disconnect();
  }, [to]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-primary">{n.toLocaleString()}{suffix}</div>
      <div className="text-sm text-white/70 font-medium mt-1">{label}</div>
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────── */
const SERVICES = [
  { icon: Sparkles,  label: "Maid",      desc: "Professional house cleaning, laundry, and daily household duties.",       color: "#1E90FF" },
  { icon: Car,       label: "Driver",    desc: "Experienced, licensed drivers for daily commutes and outstation trips.",  color: "#32CD32" },
  { icon: Shield,    label: "Guard",     desc: "Trained security guards for homes, offices, and commercial buildings.",   color: "#9B59B6" },
  { icon: ChefHat,   label: "Cook",      desc: "Home cooks skilled in Pakistani, continental, and regional cuisines.",   color: "#FF8C00" },
  { icon: Baby,      label: "Nanny",     desc: "Caring, responsible nannies for infants and young children.",             color: "#E91E8C" },
  { icon: Flower2,   label: "Gardener",  desc: "Expert gardeners to maintain lawns, plants, and outdoor spaces.",        color: "#00BCD4" },
];

const VALUES = [
  { icon: ShieldCheck, title: "CNIC Verified",     desc: "Every worker's national identity is verified before listing. No fake profiles, ever.",    color: "#1E90FF" },
  { icon: BadgeCheck,  title: "Background Checks", desc: "Criminal background checks and reference verification for all registered workers.",        color: "#32CD32" },
  { icon: Star,        title: "Ratings & Reviews",  desc: "Transparent review system ensures accountability and continuous service improvement.",    color: "#FF8C00" },
  { icon: Zap,         title: "Instant Matching",   desc: "Post a task or browse profiles — get matched with available workers in your city fast.", color: "#9B59B6" },
  { icon: Clock,       title: "Attendance Tracking", desc: "Built-in monthly attendance calendar so you always know your worker's presence.",        color: "#E91E8C" },
  { icon: Heart,       title: "Worker Welfare",      desc: "We ensure fair wages, timely payments, and dignified working conditions for all.",       color: "#00BCD4" },
];

const TEAM = [
  { name: "Ahmad Raza", role: "Founder & CEO", initials: "AR", color: "#1E90FF", bio: "Serial entrepreneur with 10+ years in Pakistan's gig economy and home services space." },
  { name: "Sana Mirza", role: "Head of Operations", initials: "SM", color: "#32CD32", bio: "Former HR director specializing in workforce management and verification systems." },
  { name: "Bilal Khan", role: "CTO", initials: "BK", color: "#FF8C00", bio: "Full-stack engineer who built scalable marketplace platforms across South Asia." },
  { name: "Hira Fatima", role: "Community Lead", initials: "HF", color: "#9B59B6", bio: "Champion of worker rights, running training programs and skill development workshops." },
];

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Hyderabad", "Sialkot", "Gujranwala", "Abbottabad"];

/* ── Glass card style ────────────────────────────────────────────── */
const G: React.CSSProperties = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 4px 24px rgba(30,144,255,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
};

export default function About() {
  useReveal();
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col">

      {/* ── BANNER ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: 340 }}>
        <img src={kwBanner} alt="KaamWali.com" className="w-full h-full object-cover absolute inset-0" style={{ minHeight: 340 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(5,15,50,0.72) 0%, rgba(5,15,50,0.30) 60%, rgba(5,15,50,0.08) 100%)" }} />

        {/* Floating logo card */}
        <div className="absolute top-6 right-6 hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.30)" }}>
          <img src={kwLogo} alt="KaamWali logo" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-white font-bold text-sm">KaamWali.com</div>
            <div className="text-white/60 text-xs">Pakistan's #1 Verified Workforce</div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 md:py-20">
          <div className="max-w-xl sr sr-delay-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-green-300 mb-4"
              style={{ background: "rgba(50,205,50,0.18)", border: "1px solid rgba(50,205,50,0.38)" }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Pakistan's Most Trusted Workforce Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
              About <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#1E90FF,#32CD32)" }}>KaamWali.com</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Connecting verified, skilled service workers with Pakistani families and businesses — safely, quickly, and with dignity.
            </p>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none" style={{ height: 44 }}>
            <path d="M0 56V28C240 56 480 0 720 18C960 36 1200 8 1440 28V56H0Z" fill="rgba(232,244,253,0.95)" />
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section className="py-10" style={{ background: "linear-gradient(135deg,#0b1535,#1E3A8A)", borderBottom: "1px solid rgba(30,144,255,0.25)" }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <Counter to={1200} suffix="+" label="Verified Workers" />
            <Counter to={12}   suffix=""  label="Cities Covered" />
            <Counter to={4800} suffix="+" label="Happy Families" />
            <Counter to={98}   suffix="%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* ── OUR STORY ──────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text */}
            <div className="sr sr-delay-0 space-y-5">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Story</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                  Born from a real problem Pakistani families face every day
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                KaamWali.com was founded in 2023 after our team witnessed firsthand how difficult and unsafe it was for households to find trustworthy domestic workers — and how hard it was for skilled workers to find stable, fairly-paid employment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We built a platform that places <strong className="text-foreground">verified identity</strong> at the core. Every worker goes through CNIC verification, reference checks, and category-specific screening before appearing on KaamWali. No guessing. No risks.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today we serve thousands of families across 12 cities, with a growing network of maids, drivers, cooks, guards, nannies, and gardeners who rely on KaamWali for dignified, consistent work.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {["CNIC Verified", "Background Checked", "Rated & Reviewed", "Insured Listings"].map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-primary"
                    style={{ background: "rgba(30,144,255,0.10)", border: "1px solid rgba(30,144,255,0.25)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Logo + trust card */}
            <div className="sr sr-delay-2 flex flex-col items-center gap-6">
              <div className="rounded-3xl p-8 flex items-center justify-center" style={G}>
                <img src={kwLogo} alt="KaamWali.com Logo" className="w-48 md:w-64 object-contain drop-shadow-md" />
              </div>

              <div className="w-full grid grid-cols-3 gap-3">
                {[
                  { label: "Founded", value: "2023" },
                  { label: "Workers", value: "1,200+" },
                  { label: "Cities", value: "12+" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl p-4 text-center" style={G}>
                    <div className="text-2xl font-extrabold text-primary">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ──────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "rgba(235,245,255,0.50)" }}>
        <div className="container mx-auto px-6">
          <div className="sr text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Services</p>
            <h2 className="text-3xl font-extrabold text-foreground">What we offer</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm">
              Six categories of skilled, background-verified professionals available in your city.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label}
                  className="sr group rounded-2xl p-5 flex gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                  style={{ ...G, "--sr-delay": `${i * 70}ms` } as React.CSSProperties}
                  onClick={() => navigate("/")}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}35`, color: s.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{s.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold transition-all" style={{ color: s.color }}>
                      Browse {s.label}s <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY TRUST US ───────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="sr text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Trust & Safety</p>
            <h2 className="text-3xl font-extrabold text-foreground">Why families trust KaamWali</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={v.title}
                  className="sr rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{ ...G, "--sr-delay": `${i * 60}ms` } as React.CSSProperties}
                >
                  <div className="absolute top-3 right-3 text-5xl font-black opacity-[0.04] text-foreground select-none leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${v.color}18`, border: `1.5px solid ${v.color}35`, color: v.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "linear-gradient(135deg,#0b1535,#1E3A8A)" }}>
        <div className="container mx-auto px-6">
          <div className="sr text-center mb-12">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-3xl font-extrabold text-white">How it works</h2>
            <p className="text-white/55 mt-2 max-w-md mx-auto text-sm">From browsing to booking in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px" style={{ background: "rgba(30,144,255,0.25)" }} />

            {[
              { n: "01", title: "Browse & Filter", desc: "Search 1,200+ verified workers by category, city, experience, and rating.", icon: Users },
              { n: "02", title: "Review & Book", desc: "Read real customer reviews, view CNIC verification status, and confirm a monthly hire.", icon: BadgeCheck },
              { n: "03", title: "Manage & Pay", desc: "Track attendance on the built-in calendar, post one-off tasks, and rate your worker.", icon: Star },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="sr flex flex-col items-center text-center gap-4"
                  style={{ "--sr-delay": `${i * 100}ms` } as React.CSSProperties}>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                    style={{ background: "linear-gradient(135deg,#1E90FF,#0060cc)", boxShadow: "0 8px 32px rgba(30,144,255,0.45)" }}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-white/8 -mt-3 select-none">{step.n}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MEET THE TEAM ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="sr text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Team</p>
            <h2 className="text-3xl font-extrabold text-foreground">Meet the people behind KaamWali</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((m, i) => (
              <div key={m.name}
                className="sr rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ ...G, "--sr-delay": `${i * 70}ms` } as React.CSSProperties}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-extrabold text-white"
                  style={{ background: `linear-gradient(135deg,${m.color},${m.color}99)`, boxShadow: `0 6px 20px ${m.color}40` }}>
                  {m.initials}
                </div>
                <h3 className="font-bold text-foreground">{m.name}</h3>
                <p className="text-xs font-semibold text-primary mt-0.5 mb-2">{m.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITIES ─────────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "rgba(235,245,255,0.50)" }}>
        <div className="container mx-auto px-6">
          <div className="sr text-center mb-8">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Coverage</p>
            <h2 className="text-2xl font-extrabold text-foreground">Cities we serve</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map((city, i) => (
              <div key={city}
                className="sr flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all hover:scale-105 hover:shadow-md cursor-default"
                style={{ ...G, "--sr-delay": `${i * 40}ms` } as React.CSSProperties}
              >
                <MapPin className="w-3.5 h-3.5 text-primary" /> {city}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / CTA ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="sr rounded-3xl overflow-hidden" style={{
            background: "linear-gradient(135deg,#0b1535 0%,#1E3A8A 50%,#0b1535 100%)",
            boxShadow: "0 12px 48px rgba(30,144,255,0.25)",
          }}>
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

            <div className="relative px-8 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left max-w-lg">
                <h2 className="text-3xl font-extrabold text-white mb-3">Ready to get started?</h2>
                <p className="text-white/60 leading-relaxed">
                  Browse verified workers in your city or register as a worker to start earning. Trusted by thousands of Pakistani families.
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <a href="mailto:hello@kaamwali.com"
                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                    <Mail className="w-4 h-4" /> hello@kaamwali.com
                  </a>
                  <a href="tel:+923001234567"
                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                    <Phone className="w-4 h-4" /> +92 300 1234567
                  </a>
                  <span className="flex items-center gap-2 text-white/70 text-sm">
                    <Globe className="w-4 h-4" /> kaamwali.com
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#1E90FF,#0060cc)", boxShadow: "0 6px 20px rgba(30,144,255,0.45)" }}
                >
                  Browse Workers
                </button>
                <button
                  onClick={() => navigate("/workers/new")}
                  className="px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:bg-white/20"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
                >
                  Join as Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

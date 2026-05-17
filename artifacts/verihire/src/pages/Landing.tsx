import { useState, useEffect, useRef } from "react";
import { useListWorkers, useListFeaturedWorkers, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { WorkerCard } from "@/components/WorkerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShieldCheck, Search, Users, Award, ChefHat, Car, Sparkles, Shield,
  Star, CheckCircle2, MapPin, Zap, Clock, ArrowRight, BadgeCheck,
} from "lucide-react";
import heroImg from "@/assets/hero.png";

/* ── Scroll-reveal hook ──────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("sr-visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".sr");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

/* ── Floating hero character cards ──────────────────────────────── */
const HERO_CHARS = [
  {
    icon: ChefHat,
    name: "Fatima A.",
    cat: "Cook",
    city: "Karachi",
    rating: 4.9,
    live: true,
    color: "#FF8C00",
    bg: "rgba(255,140,0,0.13)",
    border: "rgba(255,140,0,0.32)",
    floatClass: "kw-float-1",
    pos: { top: "6%", right: "4%" },
  },
  {
    icon: Sparkles,
    name: "Amna K.",
    cat: "Maid",
    city: "Lahore",
    rating: 4.8,
    live: false,
    color: "#1E90FF",
    bg: "rgba(30,144,255,0.13)",
    border: "rgba(30,144,255,0.30)",
    floatClass: "kw-float-2",
    pos: { top: "36%", right: "20%" },
  },
  {
    icon: Car,
    name: "Tariq M.",
    cat: "Driver",
    city: "Islamabad",
    rating: 5.0,
    live: true,
    color: "#32CD32",
    bg: "rgba(50,205,50,0.12)",
    border: "rgba(50,205,50,0.30)",
    floatClass: "kw-float-3",
    pos: { top: "64%", right: "4%" },
  },
  {
    icon: Shield,
    name: "Usman R.",
    cat: "Guard",
    city: "Rawalpindi",
    rating: 4.7,
    live: false,
    color: "#9B59B6",
    bg: "rgba(155,89,182,0.13)",
    border: "rgba(155,89,182,0.28)",
    floatClass: "kw-float-4",
    pos: { top: "18%", right: "32%" },
  },
];

/* ── Stat counter (animated) ─────────────────────────────────────── */
function AnimatedStat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / 60);
      const id = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(id); }
        else setCount(start);
      }, 20);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-primary">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium mt-1">{label}</div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function Landing() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [city, setCity] = useState("all");

  useScrollReveal();

  const { data: featuredWorkers } = useListFeaturedWorkers();
  const { data: categories } = useGetCategoryBreakdown();

  const queryParams: Record<string, string> = { verificationStatus: "approved" };
  if (search) queryParams.search = search;
  if (category !== "all") queryParams.category = category;
  if (city !== "all") queryParams.city = city;

  const { data: workers, isLoading: loadingWorkers } = useListWorkers(queryParams);
  const categoriesList = ["maid", "driver", "guard", "cook", "nanny", "gardener", "other"];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "min(90vh, 680px)" }}>
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Trusted Workers" className="w-full h-full object-cover opacity-85" />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(105deg, rgba(8,20,60,0.92) 0%, rgba(8,20,60,0.78) 45%, rgba(8,20,60,0.25) 100%)"
          }} />
        </div>

        {/* Ambient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1E90FF 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, #32CD32 0%, transparent 70%)", transform: "translateY(40%)" }} />

        {/* Left hero content */}
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-xl">
            {/* Badge */}
            <div className="sr sr-delay-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 text-green-300"
              style={{ background: "rgba(50,205,50,0.15)", border: "1px solid rgba(50,205,50,0.35)" }}>
              <ShieldCheck className="w-4 h-4" /> 100% CNIC Verified Workers
            </div>

            <h1 className="sr sr-delay-1 text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              Hire trusted help with{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #1E90FF, #32CD32)" }}>
                  absolute confidence
                </span>
              </span>
            </h1>

            <p className="sr sr-delay-2 text-lg text-white/65 mb-8 leading-relaxed max-w-lg">
              Every worker is personally verified by our team. Find reliable maids, drivers, cooks, and guards for your home or business.
            </p>

            {/* Search bar */}
            <div className="sr sr-delay-3 rounded-2xl p-3 flex flex-col md:flex-row gap-3 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                <input
                  placeholder="What service do you need?"
                  className="w-full pl-10 h-11 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full md:w-[160px] h-11 rounded-xl text-white border-white/20"
                  style={{ background: "rgba(255,255,255,0.10)" }}>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Karachi">Karachi</SelectItem>
                  <SelectItem value="Lahore">Lahore</SelectItem>
                  <SelectItem value="Islamabad">Islamabad</SelectItem>
                  <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                </SelectContent>
              </Select>
              <button
                className="h-11 px-6 rounded-xl font-bold text-white text-sm flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg, #1E90FF, #0060cc)", boxShadow: "0 4px 16px rgba(30,144,255,0.45)" }}
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </div>
        </div>

        {/* Floating worker character cards — right side, desktop only */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-[45%] z-10 pointer-events-none">
          {HERO_CHARS.map((char) => {
            const Icon = char.icon;
            return (
              <div
                key={char.name}
                className={`absolute ${char.floatClass} pointer-events-none`}
                style={char.pos as React.CSSProperties}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: "rgba(10,20,50,0.65)",
                    backdropFilter: "blur(18px)",
                    border: `1px solid ${char.border}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)`,
                    minWidth: 190,
                  }}
                >
                  {/* Icon circle */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: char.bg, border: `1px solid ${char.border}`, color: char.color }}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-semibold text-sm">{char.name}</span>
                      {char.live && (
                        <span className="w-2 h-2 rounded-full bg-green-400 kw-pulse-dot flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{char.cat} · {char.city}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-amber-400 text-xs font-bold">{char.rating.toFixed(1)}</span>
                      <CheckCircle2 className="w-3 h-3 text-green-400 ml-1" />
                      <span className="text-green-400 text-xs">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Floating "Hire Now" badge */}
          <div className="absolute kw-float-2 text-center" style={{ top: "52%", right: "38%" }}>
            <div className="px-3 py-2 rounded-xl text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, rgba(255,140,0,0.85), rgba(255,100,0,0.85))",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,140,0,0.4)",
                boxShadow: "0 4px 16px rgba(255,140,0,0.35)",
              }}>
              <Zap className="w-3.5 h-3.5 inline mr-1" />
              Instant Hire
            </div>
          </div>

          {/* Rating badge */}
          <div className="absolute kw-float-3" style={{ top: "80%", right: "28%" }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(10,20,50,0.65)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-bold">4.9</span>
              <span className="text-white/50">avg rating</span>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none" style={{ height: 48 }}>
            <path d="M0 60V30C240 60 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="rgba(232,244,253,0.95)" />
          </svg>
        </div>
      </section>

      {/* ── TRUST STATS BAR ─────────────────────────────────────────── */}
      <section className="py-10 border-b" style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(12px)" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 divide-x divide-border/50">
            <AnimatedStat target={1200} suffix="+" label="Verified Workers" />
            <AnimatedStat target={12} suffix="" label="Cities Covered" />
            <AnimatedStat target={4800} suffix="+" label="Happy Families" />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="py-8 border-b border-border/50" style={{ background: "rgba(255,255,255,0.45)" }}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-3 gap-2.5 snap-x scrollbar-hide">
            <Button
              variant={category === "all" ? "default" : "outline"}
              className="rounded-full snap-start whitespace-nowrap transition-all duration-200 hover:scale-105"
              onClick={() => setCategory("all")}
            >
              All Services
            </Button>
            {categoriesList.map((cat) => {
              const stats = categories?.find((c) => c.category === cat);
              return (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className="rounded-full snap-start whitespace-nowrap capitalize transition-all duration-200 hover:scale-105"
                  onClick={() => setCategory(cat)}
                >
                  {cat} {stats ? `(${stats.approved})` : ""}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      {category === "all" && !search && city === "all" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="sr text-center mb-10">
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Simple Process</p>
              <h2 className="text-3xl font-extrabold text-foreground">How KaamWali works</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">Three easy steps to get verified help at your doorstep</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: <Search className="w-6 h-6" />,
                  title: "Browse & Filter",
                  desc: "Search from 1,200+ CNIC-verified workers by category, city, and rating.",
                  color: "#1E90FF",
                  delay: "sr-delay-1",
                },
                {
                  step: "02",
                  icon: <BadgeCheck className="w-6 h-6" />,
                  title: "Review & Book",
                  desc: "Read reviews, check their verification badge, and set a monthly salary.",
                  color: "#FF8C00",
                  delay: "sr-delay-2",
                },
                {
                  step: "03",
                  icon: <Clock className="w-6 h-6" />,
                  title: "Manage & Track",
                  desc: "Mark attendance on the calendar, post tasks, and leave reviews.",
                  color: "#32CD32",
                  delay: "sr-delay-3",
                },
              ].map((item) => (
                <div key={item.step} className={`sr ${item.delay} group rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.75)",
                    boxShadow: "0 4px 20px rgba(30,144,255,0.07)",
                  }}>
                  {/* Step number background */}
                  <div className="absolute top-4 right-4 text-6xl font-black opacity-[0.04] text-foreground select-none pointer-events-none leading-none">
                    {item.step}
                  </div>

                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color}18`, border: `1.5px solid ${item.color}35`, color: item.color }}>
                    {item.icon}
                  </div>

                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: item.color }}>Step {item.step}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold transition-all" style={{ color: item.color }}>
                    Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED ─────────────────────────────────────────────────── */}
      {category === "all" && !search && city === "all" && featuredWorkers && featuredWorkers.length > 0 && (
        <section className="py-14" style={{ background: "rgba(235,245,255,0.50)" }}>
          <div className="container mx-auto px-4">
            <div className="sr flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-2xl font-bold">Featured Top Rated</h2>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Highest rated this month</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredWorkers.map((worker, i) => (
                <div
                  key={worker.id}
                  className="sr"
                  style={{ "--sr-delay": `${i * 80}ms` } as React.CSSProperties}
                >
                  <WorkerCard worker={worker} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL WORKERS ──────────────────────────────────────────────── */}
      <section className="py-14 flex-1">
        <div className="container mx-auto px-4">
          <div className="sr flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {category !== "all" ? <span className="capitalize">{category}s</span> : "Available Workers"}
            </h2>
            {workers && workers.length > 0 && (
              <span className="text-sm text-muted-foreground">{workers.length} workers found</span>
            )}
          </div>

          {loadingWorkers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-[340px] rounded-2xl bg-white/40 animate-pulse border border-white/60" />
              ))}
            </div>
          ) : workers && workers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {workers.map((worker, i) => (
                <div
                  key={worker.id}
                  className="sr"
                  style={{ "--sr-delay": `${(i % 8) * 60}ms` } as React.CSSProperties}
                >
                  <WorkerCard worker={worker} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No workers found</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Try adjusting your search filters or browse a different category.
              </p>
              <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setSearch(""); setCategory("all"); setCity("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

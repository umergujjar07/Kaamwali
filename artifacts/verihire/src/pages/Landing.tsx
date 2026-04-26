import { useState } from "react";
import { useListWorkers, useListFeaturedWorkers, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { WorkerCard } from "@/components/WorkerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Search, Users, Star, Award } from "lucide-react";
import heroImg from "@/assets/hero.png";

export default function Landing() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [city, setCity] = useState("all");

  const { data: featuredWorkers, isLoading: loadingFeatured } = useListFeaturedWorkers();
  const { data: categories } = useGetCategoryBreakdown();

  const queryParams: any = { verificationStatus: "approved" };
  if (search) queryParams.search = search;
  if (category !== "all") queryParams.category = category;
  if (city !== "all") queryParams.city = city;

  const { data: workers, isLoading: loadingWorkers } = useListWorkers(queryParams);

  const categoriesList = ["maid", "driver", "guard", "cook", "nanny", "gardener", "other"];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-muted overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Trusted Workers" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/30" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-success/10 text-success hover:bg-success/20 border-success/20 px-3 py-1 text-sm font-medium rounded-full">
              <ShieldCheck className="w-4 h-4 mr-2" /> 100% Verified Workers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Hire trusted help with absolute confidence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Every worker is personally verified by our team. Find reliable maids, drivers, cooks, and guards for your home or business.
            </p>
            
            <div className="bg-background rounded-2xl p-4 shadow-xl border flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="What service do you need?" 
                  className="pl-10 h-12 text-base rounded-xl border-border/50 bg-muted/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full md:w-[180px] h-12 rounded-xl">
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
              <Button className="h-12 px-8 rounded-xl text-base font-semibold shadow-md">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-background border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
            <Button 
              variant={category === "all" ? "default" : "outline"} 
              className="rounded-full snap-start whitespace-nowrap"
              onClick={() => setCategory("all")}
            >
              All Services
            </Button>
            {categoriesList.map(cat => {
              const stats = categories?.find(c => c.category === cat);
              return (
                <Button 
                  key={cat}
                  variant={category === cat ? "default" : "outline"} 
                  className="rounded-full snap-start whitespace-nowrap capitalize"
                  onClick={() => setCategory(cat)}
                >
                  {cat} {stats ? `(${stats.approved})` : ''}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {category === "all" && !search && city === "all" && featuredWorkers && featuredWorkers.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Award className="w-6 h-6 text-warning" />
              <h2 className="text-2xl font-bold">Featured Top Rated</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredWorkers.map(worker => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Workers */}
      <section className="py-16 bg-background flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">
            {category !== "all" ? <span className="capitalize">{category}s</span> : "Available Workers"}
          </h2>
          
          {loadingWorkers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-[350px] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : workers && workers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workers.map(worker => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No workers found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search filters or browse a different category.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setCategory("all"); setCity("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Badge({ children, className }: any) {
  return <span className={`inline-flex items-center ${className}`}>{children}</span>;
}

import { useState } from "react";
import { useListCustomers } from "@workspace/api-client-react";
import { Search, MapPin, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useListCustomers();

  const filtered = (customers ?? []).filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All registered customer accounts</p>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
        <div className="text-2xl font-bold text-foreground">{customers?.length ?? 0}</div>
        <div className="text-sm text-muted-foreground">total customers registered</div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city, or phone..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No customers found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-4 py-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                  {c.photoUrl
                    ? <img src={c.photoUrl} alt={c.fullName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">{c.fullName.charAt(0)}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">{c.fullName}</div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{c.phone}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{c.city}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />Joined {format(new Date(c.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">ID #{c.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

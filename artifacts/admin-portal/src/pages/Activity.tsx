import { useListRecentActivity } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListRecentActivityQueryKey } from "@workspace/api-client-react";
import { RefreshCw, Activity as ActivityIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  worker_registered:   { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-400" },
  worker_verified:     { bg: "bg-green-500/10",  text: "text-green-400",  dot: "bg-green-400" },
  worker_rejected:     { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-400" },
  booking_created:     { bg: "bg-cyan-500/10",   text: "text-cyan-400",   dot: "bg-cyan-400" },
  booking_completed:   { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
  booking_cancelled:   { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
  task_posted:         { bg: "bg-indigo-500/10", text: "text-indigo-400", dot: "bg-indigo-400" },
  task_completed:      { bg: "bg-teal-500/10",   text: "text-teal-400",   dot: "bg-teal-400" },
  review_submitted:    { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
};

export default function Activity() {
  const qc = useQueryClient();
  const { data: activities, isLoading, isFetching } = useListRecentActivity();

  const refresh = () => qc.invalidateQueries({ queryKey: getListRecentActivityQueryKey() });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Activity Feed</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Recent platform events in real time</p>
        </div>
        <button
          onClick={refresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading activity...</div>
      ) : !activities || activities.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <ActivityIcon className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">No activity yet.</div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {activities.map(a => {
              const style = TYPE_STYLES[a.type] ?? { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-muted-foreground" };
              return (
                <div key={a.id} className="flex items-start gap-4 px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="flex-shrink-0 mt-1.5">
                    <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground">{a.description}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                        {a.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground/60 flex-shrink-0 whitespace-nowrap">
                    #{a.id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

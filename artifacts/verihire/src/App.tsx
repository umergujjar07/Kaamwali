import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { Layout } from "@/components/Layout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { RoleProvider } from "@/components/RoleContext";

import Landing from "@/pages/Landing";
import WorkerRegistration from "@/pages/WorkerRegistration";
import WorkerDetail from "@/pages/WorkerDetail";
import Tasks from "@/pages/Tasks";
import PostTask from "@/pages/PostTask";
import TaskDetail from "@/pages/TaskDetail";
import Bookings from "@/pages/Bookings";
import BookingDetail from "@/pages/BookingDetail";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminWorkerReview from "@/pages/AdminWorkerReview";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <RoleProvider>
      <Layout>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/workers/new" component={WorkerRegistration} />
            <Route path="/workers/:id" component={WorkerDetail} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/tasks/new" component={PostTask} />
            <Route path="/tasks/:id" component={TaskDetail} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/bookings/:id" component={BookingDetail} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/workers/:id" component={AdminWorkerReview} />
            <Route component={NotFound} />
          </Switch>
        </WouterRouter>
      </Layout>
    </RoleProvider>
  );
}

export default App;

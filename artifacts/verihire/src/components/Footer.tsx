import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-white py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              V
            </div>
            <span className="font-bold text-lg tracking-tight">VeriHire</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every worker is verified by a real human admin, so customers hire with confidence.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm">For Customers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-primary transition-colors">Browse Workers</Link></li>
            <li><Link href="/tasks/new" className="hover:text-primary transition-colors">Post a Task</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">How Verification Works</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm">For Workers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/workers/new" className="hover:text-primary transition-colors">Register as Worker</Link></li>
            <li><Link href="/tasks" className="hover:text-primary transition-colors">Find Jobs</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VeriHire. All rights reserved.
      </div>
    </footer>
  );
}

import { Link } from "wouter";
import { Shield, Users, FileText, Bell, ArrowRight } from "lucide-react";
import logoSrc from "/logo.svg";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(220,30%,6%)] text-[hsl(220,20%,90%)] flex flex-col">
      <header className="border-b border-[hsl(220,20%,14%)] px-8 py-4 flex items-center justify-between">
        <img src={logoSrc} alt="MTC Group" className="h-9 w-auto" data-testid="landing-logo" />
        <Link
          href="/sign-in"
          className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors"
          data-testid="button-staff-login"
        >
          Staff Login
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-sm mb-8">
            <Shield className="h-3 w-3" />
            Secure Staff Portal
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
            MTC Group of Companies
            <br />
            <span className="text-primary">Internal Operations Portal</span>
          </h1>

          <p className="text-[hsl(220,10%,60%)] text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Authorized staff access only. This portal is restricted to MTC Group employees and is monitored for compliance and security.
          </p>

          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-colors text-sm"
            data-testid="button-landing-sign-in"
          >
            Sign In to Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <div className="border-t border-[hsl(220,20%,14%)] px-8 py-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          {[
            { icon: Shield, label: "Secure Access", desc: "Multi-factor authentication and role-based access control" },
            { icon: Users, label: "Team Management", desc: "Department hierarchy, staff onboarding and lifecycle" },
            { icon: Bell, label: "Real-time Alerts", desc: "Security monitoring and compliance notifications" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-[hsl(220,10%,50%)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[hsl(220,20%,14%)] px-8 py-4 text-center">
        <p className="text-xs text-[hsl(220,10%,40%)]">
          &copy; {new Date().getFullYear()} MTC Group of Companies. All rights reserved. Unauthorized access is prohibited and monitored.
        </p>
      </div>
    </div>
  );
}

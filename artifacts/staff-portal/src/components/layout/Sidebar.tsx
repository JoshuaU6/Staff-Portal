import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase,
  CheckSquare,
  FileText,
  Megaphone,
  Users,
  Building2,
  Shield,
  ActivitySquare,
  MonitorSmartphone,
  LogOut,
  Settings,
  ChevronRight,
  ChevronDown,
  UserCircle,
  Briefcase,
  Mail,
  Globe,
  Sun,
  Moon,
  ChevronsUpDown,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import i18n, { LANGUAGES } from "@/i18n";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const staffLinkDefs = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/department", labelKey: "nav.department", icon: Briefcase },
  { href: "/tasks", labelKey: "nav.tasks", icon: CheckSquare },
  { href: "/documents", labelKey: "nav.documents", icon: FileText },
  { href: "/announcements", labelKey: "nav.announcements", icon: Megaphone },
  { href: "/messages", labelKey: "nav.messages", icon: Mail },
  { href: "/profile", labelKey: "nav.profile", icon: UserCircle },
];

const adminManagementLinks = [
  { href: "/admin", labelKey: "nav.admin_overview", icon: Settings },
  { href: "/admin/users", labelKey: "nav.user_management", icon: Users },
  { href: "/admin/departments", labelKey: "nav.departments", icon: Building2 },
  { href: "/admin/announcements", labelKey: "nav.announcements", icon: Megaphone },
  { href: "/admin/tasks", labelKey: "nav.task_management", icon: CheckSquare },
  { href: "/admin/documents", labelKey: "nav.documents", icon: FileText },
  { href: "/admin/jobs", labelKey: "nav.job_postings", icon: Briefcase },
  { href: "/admin/job-applications", labelKey: "nav.job_applications", icon: Users },
];

const adminSecurityLinks = [
  { href: "/admin/audit-logs", labelKey: "nav.audit_logs", icon: ActivitySquare },
  { href: "/admin/sessions", labelKey: "nav.active_sessions", icon: MonitorSmartphone },
  { href: "/admin/alerts", labelKey: "nav.security_alerts", icon: Shield },
  { href: "/admin/policy", labelKey: "nav.policy_compliance", icon: FileText },
];

const complianceOnlyLinkDefs = [
  { href: "/admin/audit-logs", labelKey: "nav.audit_logs", icon: ActivitySquare },
  { href: "/admin/policy", labelKey: "nav.policy_compliance", icon: FileText },
];

const auditorLinkDefs = [
  { href: "/admin/audit-logs", labelKey: "nav.audit_logs", icon: ActivitySquare },
  { href: "/admin/sessions", labelKey: "nav.active_sessions", icon: MonitorSmartphone },
  { href: "/admin/alerts", labelKey: "nav.security_alerts", icon: Shield },
];

const chairmanLinks = [
  { href: "/chairman/emergency", labelKey: "nav.emergency_controls", icon: Lock },
];

const ADMIN_ROLES = ["chairman", "ict_admin", "hr_admin"];
const COMPLIANCE_ADMIN_ROLES = ["compliance_admin"];
const AUDITOR_ROLES = ["auditor"];

function useUnreadMessageCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
    const fetchCount = () => {
      fetch(`${apiBase}/api/messages?box=inbox`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : [])
        .then((msgs: Array<{ isRead: boolean }>) => {
          setCount(msgs.filter((m) => !m.isRead).length);
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60_000); // poll every 60s
    return () => clearInterval(interval);
  }, []);
  return count;
}

function NavGroupWithMessageBadge({ label, links, testIdPrefix, onClose }: {
  label: string;
  links: { href: string; labelKey: string; icon: React.ElementType }[];
  testIdPrefix: string;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const unread = useUnreadMessageCount();
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full px-3 py-1 mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 hover:text-sidebar-foreground/60 transition-colors"
        data-testid={`nav-group-${testIdPrefix}`}
      >
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className={cn("h-2.5 w-2.5 transition-transform duration-200", open ? "rotate-0" : "-rotate-90")} />
      </button>
      {open && (
        <div>
          {links.map(({ href, labelKey, icon }) => (
            <NavLink
              key={href}
              href={href}
              labelKey={labelKey}
              icon={icon}
              testId={`nav-${href.replace(/\//g, "-").replace(/^-/, "")}`}
              onClose={onClose}
              badge={href === "/messages" ? unread : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavLink({ href, labelKey, icon: Icon, testId, onClose, badge }: {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  testId: string;
  onClose?: () => void;
  badge?: number;
}) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const active = location === href || location.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150 mb-0.5",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
      data-testid={testId}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate">{t(labelKey)}</span>
      {badge && badge > 0 ? (
        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : active ? (
        <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
      ) : null}
    </Link>
  );
}

function NavGroup({ label, links, testIdPrefix, defaultOpen = true, onClose }: {
  label: string;
  links: { href: string; labelKey: string; icon: React.ElementType }[];
  testIdPrefix: string;
  defaultOpen?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full px-3 py-1 mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 hover:text-sidebar-foreground/60 transition-colors"
        data-testid={`nav-group-${testIdPrefix}`}
      >
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className={cn("h-2.5 w-2.5 transition-transform duration-200", open ? "rotate-0" : "-rotate-90")} />
      </button>
      {open && (
        <div>
          {links.map(({ href, labelKey, icon }) => (
            <NavLink
              key={href}
              href={href}
              labelKey={labelKey}
              icon={icon}
              testId={`nav-${href.replace(/\//g, "-").replace(/^-/, "")}`}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: staffProfile } = useGetCurrentUser();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const role = staffProfile?.role ?? "";
  const isAdmin = ADMIN_ROLES.includes(role);
  const isChairman = role === "chairman";
  const isComplianceAdmin = COMPLIANCE_ADMIN_ROLES.includes(role);
  const isAuditor = AUDITOR_ROLES.includes(role);
  const hasAdminPanel = isAdmin || isComplianceAdmin || isAuditor;

  const displayName = staffProfile?.fullName ?? user?.fullName ?? "Staff Member";
  const displayRole = staffProfile?.role?.replace(/_/g, " ") ?? "Staff";
  const initial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="flex flex-col h-full w-60 bg-sidebar border-r border-sidebar-border"
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div style={{ width: '100%', height: '43px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={`${import.meta.env.BASE_URL}portal-logo.png`}
            alt="MTC Group of Companies"
            data-testid="sidebar-logo"
            style={{ position: 'absolute', width: '125px', top: '-37px', left: '-22px' }}
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 sidebar-scroll" data-testid="sidebar-nav">
        <NavGroupWithMessageBadge
          label={t("nav.staff")}
          links={staffLinkDefs}
          testIdPrefix="staff"
          onClose={onClose}
        />

        {hasAdminPanel && (
          <>
            {isAdmin && (
              <>
                <NavGroup
                  label={t("nav.administration")}
                  links={adminManagementLinks}
                  testIdPrefix="admin-mgmt"
                  onClose={onClose}
                />
                <NavGroup
                  label="Security"
                  links={adminSecurityLinks}
                  testIdPrefix="admin-security"
                  onClose={onClose}
                />
              </>
            )}
            {isComplianceAdmin && (
              <NavGroup
                label="Compliance"
                links={complianceOnlyLinkDefs}
                testIdPrefix="compliance"
                onClose={onClose}
              />
            )}
            {isAuditor && (
              <NavGroup
                label="Audit"
                links={auditorLinkDefs}
                testIdPrefix="audit"
                onClose={onClose}
              />
            )}
          </>
        )}

        {isChairman && (
          <NavGroup
            label="Executive"
            links={chairmanLinks}
            testIdPrefix="chairman"
            onClose={onClose}
          />
        )}
      </nav>

      {/* User menu */}
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded hover:bg-sidebar-accent transition-colors group"
              data-testid="sidebar-user-menu-trigger"
            >
              <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-sidebar-primary-foreground">{initial}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">{displayName}</p>
                <p className="text-[10px] text-sidebar-foreground/45 truncate capitalize leading-tight">{displayRole}</p>
              </div>
              <ChevronsUpDown className="h-3 w-3 text-sidebar-foreground/30 shrink-0 group-hover:text-sidebar-foreground/60 transition-colors" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-56 mb-1" data-testid="sidebar-user-menu">
            <DropdownMenuLabel className="font-normal py-2">
              <p className="text-sm font-semibold leading-none">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{displayRole}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Language */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid="button-language-switcher">
                <Globe className="h-3.5 w-3.5 mr-2" />
                <span>{currentLang.nativeLabel}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={cn(lang.code === i18n.language && "text-primary font-medium")}
                    data-testid={`lang-option-${lang.code}`}
                  >
                    <span>{lang.nativeLabel}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{lang.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Theme toggle */}
            <DropdownMenuItem onClick={toggleTheme} data-testid="theme-toggle-menu">
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 mr-2" />
              ) : (
                <Moon className="h-3.5 w-3.5 mr-2" />
              )}
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Back to website */}
            <DropdownMenuItem asChild data-testid="link-back-to-website">
              <a href="/" className="flex items-center">
                <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                {t("nav.back_to_website")}
              </a>
            </DropdownMenuItem>

            {/* Sign out */}
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive"
              data-testid="button-sign-out"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              {t("nav.sign_out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
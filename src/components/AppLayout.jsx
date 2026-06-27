import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText, Mail, MailOpen, Send, Briefcase,
  MessageCircle, TrendingUp, Globe, Phone, Kanban, DollarSign, LayoutGrid, Zap, Menu, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import Logo from "./Logo";

const navItems = [
  { label: "CVs",                   icon: FileText,      path: "/dashboard" },
  { label: "Job Tracker",           icon: Kanban,        path: "/job-tracker" },
  { label: "Cover Letter",          icon: Mail,          path: "/cover-letters" },
  { label: "Resignation Letter",    icon: MailOpen,      path: "/resignation-letters" },
  { label: "Recommendation Letter", icon: Send,          path: "/recommendation-letters" },
  { label: "Application Kit",       icon: Briefcase,     path: "/application-kit" },
  { label: "Resume Examples",       icon: LayoutGrid,    path: "/resume-examples" },
  { label: "Interview Prep",        icon: MessageCircle, path: "/interview-practice" },
  { label: "LinkedIn Optimizer",    icon: TrendingUp,    path: "/linkedin-optimization" },
  { label: "Salary Insights",       icon: DollarSign,    path: "/salary-insights" },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link to="/" onClick={() => setSidebarOpen(false)}><Logo size="sm" /></Link>
        <button className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Products nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <p className="px-5 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Products
        </p>
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + "/");
          return (
            <Link
              key={label}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "text-blue-600 bg-blue-50 border-r-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-500" : "text-gray-400"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-100 py-3">
        <p className="px-5 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Settings
        </p>
        <button className="flex items-center gap-3 px-5 py-2.5 w-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Globe className="w-4 h-4 text-gray-400" />
          English
        </button>
        <button
          onClick={() => { navigate("/"); setSidebarOpen(false); }}
          className="flex items-center gap-3 px-5 py-2.5 w-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Phone className="w-4 h-4 text-gray-400" />
          Contact
        </button>
      </div>

      {/* Upgrade prompt for free users */}
      {user && !isPro && (
        <div className="mx-3 mb-3">
          <button
            onClick={() => { navigate('/#pricing'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-3 py-2.5 text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Upgrade to Pro — $9/mo</span>
          </button>
        </div>
      )}

      {/* Pro badge */}
      {user && isPro && (
        <div className="mx-3 mb-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-3 py-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-700">Pro Plan Active</span>
          </div>
        </div>
      )}

      {/* User avatar */}
      <div className="border-t border-gray-100 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <span className="text-sm text-gray-700 font-medium truncate">
            {user ? firstName : "Guest"}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left sidebar — desktop: always visible, mobile: drawer */}
      <aside className={`w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col fixed h-screen z-40 transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <Logo size="sm" />
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>

      {/* Top-right greeting — desktop only */}
      <div className="hidden lg:flex fixed top-3 right-5 z-30 items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm text-gray-600 font-medium">Hello {firstName}! 👋</span>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-52 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

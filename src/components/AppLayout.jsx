import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText, Mail, MailOpen, Send, User, Briefcase,
  MessageCircle, TrendingUp, Globe, Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const navItems = [
  { label: "CVs",                   icon: FileText,      path: "/dashboard" },
  { label: "Cover Letter",          icon: Mail,          path: "/cover-letters" },
  { label: "Resignation Letter",    icon: MailOpen,      path: "/resignation-letters" },
  { label: "Recommendation Letter", icon: Send,          path: "/recommendation-letters" },
  { label: "Photo Library",         icon: User,          path: "/photo-library" },
  { label: "Application Kit",       icon: Briefcase,     path: "/application-kit" },
  { label: "Interview Practice",    icon: MessageCircle, path: "/interview-practice" },
  { label: "Linkedin Optimization", icon: TrendingUp,    path: "/linkedin-optimization" },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col fixed h-screen z-40">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <Link to="/"><Logo size="sm" /></Link>
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
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-5 py-2.5 w-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Phone className="w-4 h-4 text-gray-400" />
            Contact
          </button>
        </div>

        {/* User avatar */}
        <div className="border-t border-gray-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm text-gray-700 font-medium truncate">{firstName}</span>
          </div>
        </div>
      </aside>

      {/* Top-right greeting */}
      <div className="fixed top-3 right-5 z-30 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm text-gray-600 font-medium">Hello {firstName}! 👋</span>
      </div>

      {/* Main content */}
      <main className="flex-1 ml-52 min-h-screen">
        {children}
      </main>
    </div>
  );
}

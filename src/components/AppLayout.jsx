import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText, Mail, MailOpen, Send, Briefcase,
  MessageCircle, TrendingUp, Globe, Phone, Kanban, DollarSign, LayoutGrid, Zap, Menu, X, HelpCircle,
  Link2, Shield, Copy, Check, ExternalLink, Loader2,
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

const CONTACT_INFO = {
  email: "vikashr370@gmail.com",
  phones: ["+91 9057257152"],
  linkedin: "https://www.linkedin.com/in/vikash-raj-a12489119/",
  trailblazer: "https://trailblazer.me/id/vikash-raj",
};

const FORM_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_INFO.email)}`;

function ContactInfoRow({ icon: Icon, label, href, copyable }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
    >
      <Icon className="w-4 h-4 text-white flex-shrink-0" />
      <span className="text-sm font-semibold text-white flex-1 truncate">{label}</span>
      {copyable ? (
        <button onClick={handleCopy} className="p-1 rounded-md hover:bg-white/20 flex-shrink-0" title="Copy">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
        </button>
      ) : (
        <ExternalLink className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
      )}
    </a>
  );
}

function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: `TheResume.io contact from ${form.name}`,
          _captcha: "false",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success === "true" || data.success === true || res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="px-6 sm:px-12 pt-12 pb-2 text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] text-blue-100 uppercase mb-3">Let's Connect</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Get In Touch</h2>
          <p className="text-blue-100 text-sm max-w-lg mx-auto leading-relaxed">
            Have a question about the app, feedback, or want to connect professionally? Reach out below.
          </p>
        </div>

        <div className="px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Contact info */}
          <div className="bg-white/10 rounded-2xl p-5 sm:p-6 border border-white/10">
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Contact Info</h3>
            <div className="space-y-2.5">
              <ContactInfoRow icon={Mail} label={CONTACT_INFO.email} href={`mailto:${CONTACT_INFO.email}`} copyable />
              {CONTACT_INFO.phones.map((phone) => (
                <ContactInfoRow key={phone} icon={Phone} label={phone} href={`tel:${phone.replace(/\s+/g, "")}`} />
              ))}
              <ContactInfoRow icon={Link2} label="LinkedIn Profile" href={CONTACT_INFO.linkedin} />
              <ContactInfoRow icon={Shield} label="Trailblazer Profile" href={CONTACT_INFO.trailblazer} />
            </div>
            <div className="flex items-center gap-2 mt-5 text-xs text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              Open to new opportunities
            </div>
          </div>

          {/* Message form */}
          <div className="bg-white/10 rounded-2xl p-5 sm:p-6 border border-white/10">
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Send a Message</h3>

            {status === "success" ? (
              <div className="flex flex-col items-center text-center gap-3 py-8">
                <Check className="w-10 h-10 text-emerald-400" strokeWidth={2.5} />
                <p className="text-lg font-bold text-white">Message Sent!</p>
                <p className="text-sm text-blue-100 max-w-xs leading-relaxed">
                  Thanks for reaching out. I'll get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-1 px-4 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-lg transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-100 mb-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full rounded-lg bg-white/90 focus:bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-100 mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full rounded-lg bg-white/90 focus:bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-blue-100 mb-1">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="What would you like to say?"
                    className="w-full rounded-lg bg-white/90 focus:bg-white px-3 py-2.5 text-sm text-gray-800 outline-none resize-none transition-colors"
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-100 bg-red-500/20 border border-red-300/30 rounded-lg px-3 py-2">
                    Something went wrong. Please email me directly at {CONTACT_INFO.email}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 disabled:opacity-60 transition-colors"
                >
                  {status === "sending" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

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
        <Link
          to="/help-center"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
            location.pathname === "/help-center"
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <HelpCircle className={`w-4 h-4 ${location.pathname === "/help-center" ? "text-blue-500" : "text-gray-400"}`} />
          Help Center
        </Link>
        <button className="flex items-center gap-3 px-5 py-2.5 w-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Globe className="w-4 h-4 text-gray-400" />
          English
        </button>
        <button
          onClick={() => { setShowContact(true); setSidebarOpen(false); }}
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

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
}

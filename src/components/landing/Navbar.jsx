import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../AuthModal";
import {
  Menu, X, ChevronDown,
  FileText, Mail, MailOpen, Send, User, Briefcase, MessageCircle, TrendingUp,
} from "lucide-react";
import Logo from "../Logo";

const products = [
  {
    label: "CVs",
    path: "/dashboard",
    icon: FileText,
    preview: {
      title: "Land your dream job faster",
      description: "Build a professional CV with expert-designed templates. Tailor every section to the role and make recruiters take notice.",
      cta: "Create my CV",
      accent: "bg-blue-50",
      btnClass: "bg-blue-600 hover:bg-blue-700",
    },
  },
  {
    label: "Cover Letter",
    path: "/cover-letters",
    icon: Mail,
    preview: {
      title: "Make a lasting first impression",
      description: "Write a compelling cover letter that tells your story. Stand out from hundreds of applicants with a personalized, professional letter.",
      cta: "Write cover letter",
      accent: "bg-indigo-50",
      btnClass: "bg-indigo-600 hover:bg-indigo-700",
    },
  },
  {
    label: "Resignation Letter",
    path: "/resignation-letters",
    icon: MailOpen,
    preview: {
      title: "Leave on the right note",
      description: "Draft a professional resignation letter that maintains relationships and ensures a smooth transition from your current role.",
      cta: "Write resignation letter",
      accent: "bg-orange-50",
      btnClass: "bg-orange-500 hover:bg-orange-600",
    },
  },
  {
    label: "Recommendation Letter",
    path: "/recommendation-letters",
    icon: Send,
    preview: {
      title: "Strengthen your application",
      description: "Create powerful recommendation letters that highlight key strengths. Perfect for candidates and references alike.",
      cta: "Write recommendation",
      accent: "bg-green-50",
      btnClass: "bg-green-600 hover:bg-green-700",
    },
  },
  {
    label: "Photo Library",
    icon: User,
    preview: {
      title: "Put a face to your name",
      description: "Choose a professional headshot from our curated photo library to add a polished touch to your CV and online profiles.",
      cta: "Browse photos",
      accent: "bg-pink-50",
      btnClass: "bg-pink-500 hover:bg-pink-600",
    },
  },
  {
    label: "Application Kit",
    icon: Briefcase,
    preview: {
      title: "Everything you need to apply",
      description: "Get a complete application kit — CV, cover letter, and more — all matched and ready to send to your dream employer.",
      cta: "Build my kit",
      accent: "bg-yellow-50",
      btnClass: "bg-yellow-500 hover:bg-yellow-600",
    },
  },
  {
    label: "Interview Practice",
    icon: MessageCircle,
    preview: {
      title: "Walk in with confidence",
      description: "Practice with real interview questions tailored to your role. Get instant feedback and tips to sharpen your answers.",
      cta: "Start practicing",
      accent: "bg-purple-50",
      btnClass: "bg-purple-600 hover:bg-purple-700",
    },
  },
  {
    label: "Linkedin Optimization",
    icon: TrendingUp,
    preview: {
      title: "Get noticed by recruiters",
      description: "Turn your experience into a strong LinkedIn profile. Optimize your headline, summary, and positioning so the right opportunities find you.",
      cta: "Optimize my linkedin",
      accent: "bg-sky-50",
      btnClass: "bg-blue-600 hover:bg-blue-700",
    },
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [hovered, setHovered] = useState(products[0]);
  const closeTimer = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const openProducts = () => {
    clearTimeout(closeTimer.current);
    setProductsOpen(true);
  };

  const closeProducts = () => {
    closeTimer.current = setTimeout(() => setProductsOpen(false), 150);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/"><Logo /></Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {/* Products mega menu trigger */}
              <div className="relative" onMouseEnter={openProducts} onMouseLeave={closeProducts}>
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Products
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`} />
                </button>

                {productsOpen && (
                  <div
                    className="fixed top-16 left-0 flex shadow-2xl border-r border-b border-gray-100 bg-white overflow-hidden z-50"
                    style={{ width: 620 }}
                    onMouseEnter={openProducts}
                    onMouseLeave={closeProducts}
                  >
                    {/* Left: product list */}
                    <div className="w-56 border-r border-gray-100 py-4 flex-shrink-0">
                      <p className="px-5 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</p>
                      {products.map((p) => {
                        const Icon = p.icon;
                        const active = hovered?.label === p.label;
                        return (
                          <button
                            key={p.label}
                            className={`flex items-center gap-3 w-full px-5 py-2.5 transition-colors text-left ${active ? "bg-gray-50" : "hover:bg-gray-50"}`}
                            onMouseEnter={() => setHovered(p)}
                            onClick={() => { if (p.path) { setProductsOpen(false); navigate(p.path); } }}
                          >
                            <span className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${active ? "bg-blue-50" : "bg-gray-100"}`}>
                              <Icon className={`w-4 h-4 ${active ? "text-blue-500" : "text-gray-500"}`} />
                            </span>
                            <span className={`text-sm font-medium ${active ? "text-blue-600" : "text-gray-700"}`}>
                              {p.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right: preview panel */}
                    {hovered && (
                      <div className={`flex-1 flex flex-col justify-between p-7 ${hovered.preview.accent}`}>
                        <div>
                          <div className="w-14 h-14 rounded-2xl bg-white shadow flex items-center justify-center mb-5">
                            <hovered.icon className="w-7 h-7 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                            {hovered.preview.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {hovered.preview.description}
                          </p>
                        </div>
                        <button
                          onClick={() => { if (hovered.path) { setProductsOpen(false); navigate(hovered.path); } }}
                          className={`mt-6 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${hovered.preview.btnClass}`}
                        >
                          {hovered.preview.cta}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <a href="#templates" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Templates</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal("login")}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthModal("signup")}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <button
              className="flex items-center justify-between w-full text-gray-600 font-medium py-1"
              onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
            >
              <span>Products</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileProductsOpen && (
              <div className="pl-2 space-y-1">
                {products.map(({ label, icon: Icon, path }) => (
                  <button
                    key={label}
                    className="flex items-center gap-3 w-full py-2 text-left"
                    onClick={() => { if (path) { setMobileOpen(false); navigate(path); } }}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                    </span>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            )}
            <a href="#templates" className="block text-gray-600 hover:text-blue-600 font-medium py-1">Templates</a>
            <a href="#features" className="block text-gray-600 hover:text-blue-600 font-medium py-1">Features</a>
            {user ? (
              <>
                <Link to="/dashboard" className="block text-gray-600 hover:text-blue-600 font-medium py-1">Dashboard</Link>
                <button onClick={handleLogout} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Log Out</button>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthModal("login"); setMobileOpen(false); }} className="block w-full text-left text-gray-600 font-medium py-1">Sign In</button>
                <button onClick={() => { setAuthModal("signup"); setMobileOpen(false); }} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Get Started Free</button>
              </>
            )}
          </div>
        )}
      </nav>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(m) => setAuthModal(m)}
        />
      )}
    </>
  );
}

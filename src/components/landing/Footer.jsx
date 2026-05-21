import { Link } from "react-router-dom";
import { FileText, X as XIcon, Link2, GitBranch } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TheResume.io</span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-xs">
              The fastest way to build a professional, ATS-ready resume. Trusted by half a million job seekers worldwide.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="#" className="hover:text-white transition-colors"><XIcon className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Link2 className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><GitBranch className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {["Templates", "Features", "Pricing", "Resume Builder"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-sm text-center text-gray-500">
          © {new Date().getFullYear()} TheResume.io. All rights reserved. Built with React + Firebase.
        </div>
      </div>
    </footer>
  );
}

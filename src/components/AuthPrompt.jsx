import { useState } from "react";
import { LogIn } from "lucide-react";
import AppLayout from "./AppLayout";
import AuthModal from "./AuthModal";

export default function AuthPrompt({ title = "This feature" }) {
  const [modal, setModal] = useState(null);

  return (
    <>
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 max-w-sm w-full text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center mb-5">
              <LogIn className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
            <p className="text-gray-500 text-sm mb-7">
              {title} requires an account. Sign in or create a free account to get started.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setModal("login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setModal("signup")}
                className="w-full border border-gray-300 hover:border-blue-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </AppLayout>

      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSwitch={(m) => setModal(m)}
        />
      )}
    </>
  );
}

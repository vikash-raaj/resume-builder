import { useState, useEffect, useRef } from "react";
import { X, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const PAYPAL_LINK = "https://paypal.me/vikashraj12";
const UPI_ID = "9057257152@upi";
const UPI_NAME = "Vikash Raj";

const USD_AMOUNTS = [5, 10, 20, 50];
const INR_AMOUNTS = [100, 200, 500, 1000];

export default function BuyMeCoffee() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("paypal");

  const [usdSelected, setUsdSelected] = useState(10);
  const [usdCustom, setUsdCustom] = useState("");

  const [inrSelected, setInrSelected] = useState(1000);
  const [inrCustom, setInrCustom] = useState("");

  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);

  const finalUsd = usdCustom ? Number(usdCustom) : usdSelected;
  const finalInr = inrCustom ? Number(inrCustom) : inrSelected;

  const paypalUrl = finalUsd ? `${PAYPAL_LINK}/${finalUsd}` : PAYPAL_LINK;
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalInr || ""}&cu=INR&tn=${encodeURIComponent("Buy me a coffee")}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handlePayPal = () => {
    window.open(paypalUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Buy me a coffee"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 100%)",
          boxShadow: "0 4px 20px rgba(245, 158, 11, 0.45)",
        }}
      >
        <span className="text-base leading-none">☕</span>
        <span>Buy me a coffee</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div
              className="relative px-6 pt-7 pb-5 text-white text-center"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="text-4xl mb-2">☕</div>
              <h2 className="text-lg font-bold">Buy me a coffee</h2>
              <p className="text-xs text-amber-100 mt-1">
                If this tool helped you land a job, support the builder!
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setTab("paypal")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  tab === "paypal"
                    ? "text-amber-600 border-b-2 border-amber-500"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                💳 PayPal
              </button>
              <button
                onClick={() => setTab("upi")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  tab === "upi"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                🇮🇳 UPI (India)
              </button>
            </div>

            {/* PayPal tab */}
            {tab === "paypal" && (
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Choose an amount
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {USD_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setUsdSelected(amt); setUsdCustom(""); }}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          usdSelected === amt && !usdCustom
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 text-gray-700 hover:border-amber-300"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center border-2 border-gray-200 rounded-xl focus-within:border-amber-400 transition-colors">
                  <span className="pl-3.5 text-sm font-semibold text-gray-500">$</span>
                  <input
                    type="number"
                    min="1"
                    value={usdCustom || finalUsd}
                    onChange={(e) => { setUsdCustom(e.target.value); setUsdSelected(null); }}
                    className="flex-1 px-2 py-2.5 text-center text-base font-bold text-gray-800 outline-none bg-transparent"
                  />
                  <span className="pr-3.5 text-sm font-semibold text-gray-400">USD</span>
                </div>

                <div className="flex flex-col items-center gap-2 py-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider self-start">
                    Or scan to pay
                  </p>
                  <div className="p-3 bg-white border-2 border-amber-200 rounded-2xl">
                    <QRCodeSVG
                      value={paypalUrl}
                      size={140}
                      fgColor="#92400e"
                      bgColor="#ffffff"
                      level="M"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    Scan with phone camera · opens PayPal
                  </p>
                </div>

                <button
                  onClick={handlePayPal}
                  disabled={!finalUsd || finalUsd < 1}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
                    boxShadow: "0 4px 16px rgba(245, 158, 11, 0.4)",
                  }}
                >
                  ☕ Support ${finalUsd || "—"} via PayPal
                </button>

                <p className="text-center text-[10px] text-gray-400">
                  Secure · No PayPal account needed
                </p>
              </div>
            )}

            {/* UPI tab */}
            {tab === "upi" && (
              <div className="px-6 pt-5 pb-6 space-y-4">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                    <QRCodeSVG
                      value={upiUrl}
                      size={160}
                      fgColor="#1e1b4b"
                      bgColor="#f9fafb"
                      level="M"
                    />
                  </div>

                  {/* UPI ID pill */}
                  <button
                    onClick={copyUPI}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-1.5"
                  >
                    <span className="text-sm font-medium text-gray-700">{UPI_ID}</span>
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3 h-3 text-gray-400" />
                    }
                  </button>
                </div>

                {/* INR amount chips */}
                <div className="grid grid-cols-4 gap-2">
                  {INR_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setInrSelected(amt); setInrCustom(""); }}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                        inrSelected === amt && !inrCustom
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "border-2 border-gray-200 text-gray-700 hover:border-indigo-300"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                {/* Custom INR input */}
                <div className="relative flex items-center border-2 border-gray-200 rounded-xl focus-within:border-indigo-400 transition-colors">
                  <span className="pl-3.5 text-sm font-semibold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={inrCustom || finalInr}
                    onChange={(e) => { setInrCustom(e.target.value); setInrSelected(null); }}
                    className="flex-1 px-2 py-2.5 text-center text-base font-bold text-gray-800 outline-none bg-transparent"
                  />
                  <span className="pr-3.5 text-sm font-semibold text-gray-400">INR</span>
                </div>

                <p className="text-[10px] text-gray-400 text-center">
                  Scan with GPay · PhonePe · Paytm · BHIM · any UPI app 🙏
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

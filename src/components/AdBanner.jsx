import { useEffect, useRef, useState } from "react";

const AD_CLIENT = "ca-pub-2133408429040664";
const AD_SLOT = "3564738850";
const MOBILE_QUERY = "(max-width: 767px)";

export default function AdBanner({ className = "" }) {
  const pushedFor = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Re-push whenever the breakpoint flips, since the <ins> below is
  // keyed per-breakpoint and a new element gets mounted each time.
  useEffect(() => {
    if (pushedFor.current === isMobile) return;
    try {
      pushedFor.current = isMobile;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not loaded yet
    }
  }, [isMobile]);

  return (
    <div className={`w-full max-w-3xl mx-auto text-center ${className}`}>
      {isMobile ? (
        <ins
          key="mobile-ad"
          className="adsbygoogle"
          style={{ display: "inline-block", width: "320px", height: "50px" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-full-width-responsive="false"
        />
      ) : (
        <ins
          key="desktop-ad"
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      )}
      <p className="text-[9px] text-gray-400 text-center mt-0.5 select-none">
        Advertisement
      </p>
    </div>
  );
}

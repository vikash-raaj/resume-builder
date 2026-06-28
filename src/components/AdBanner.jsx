import { useEffect, useRef } from "react";

export default function AdBanner({ className = "" }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (adRef.current && adRef.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      // adsbygoogle not loaded yet
    }
  }, []);

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2133408429040664"
        data-ad-slot="3564738850"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

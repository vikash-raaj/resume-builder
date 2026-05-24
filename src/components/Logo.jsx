export default function Logo({ size = "md" }) {
  const iconSize = size === "sm" ? 28 : 32;

  return (
    <div className="inline-flex items-center gap-2">
      <svg width={iconSize} height={iconSize} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="20" height="24" rx="3" fill="#BFDBFE" />
        <rect x="8" y="4" width="20" height="24" rx="3" fill="#2563EB" />
        <rect x="12" y="11" width="11" height="2" rx="1" fill="white" fillOpacity="0.85" />
        <rect x="12" y="15" width="9" height="2" rx="1" fill="white" fillOpacity="0.85" />
        <rect x="12" y="19" width="7" height="2" rx="1" fill="white" fillOpacity="0.85" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-[17px] font-bold text-gray-900 tracking-tight">resume.io</span>
        <span className="text-[10px] text-gray-400 mt-0.5">by TheResumeIo.com</span>
      </div>
    </div>
  );
}

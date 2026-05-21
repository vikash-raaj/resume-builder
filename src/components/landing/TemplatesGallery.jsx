import { useNavigate } from "react-router-dom";

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    tag: "Most Popular",
    tagColor: "bg-blue-100 text-blue-700",
    accent: "#2563eb",
    preview: "blue",
  },
  {
    id: "classic",
    name: "Classic",
    tag: "Professional",
    tagColor: "bg-gray-100 text-gray-700",
    accent: "#1f2937",
    preview: "gray",
  },
  {
    id: "minimal",
    name: "Minimal",
    tag: "Clean",
    tagColor: "bg-green-100 text-green-700",
    accent: "#059669",
    preview: "green",
  },
  {
    id: "executive",
    name: "Executive",
    tag: "Premium",
    tagColor: "bg-purple-100 text-purple-700",
    accent: "#7c3aed",
    preview: "purple",
  },
  {
    id: "creative",
    name: "Creative",
    tag: "Unique",
    tagColor: "bg-orange-100 text-orange-700",
    accent: "#ea580c",
    preview: "orange",
  },
  {
    id: "tech",
    name: "Tech",
    tag: "Developer Friendly",
    tagColor: "bg-cyan-100 text-cyan-700",
    accent: "#0891b2",
    preview: "cyan",
  },
];

const colorMap = {
  blue: { header: "bg-blue-600", bar: "bg-blue-200", skill: "bg-blue-100 text-blue-700", line: "bg-blue-400" },
  gray: { header: "bg-gray-800", bar: "bg-gray-200", skill: "bg-gray-100 text-gray-700", line: "bg-gray-400" },
  green: { header: "bg-emerald-600", bar: "bg-emerald-100", skill: "bg-emerald-100 text-emerald-700", line: "bg-emerald-400" },
  purple: { header: "bg-violet-700", bar: "bg-violet-100", skill: "bg-violet-100 text-violet-700", line: "bg-violet-400" },
  orange: { header: "bg-orange-500", bar: "bg-orange-100", skill: "bg-orange-100 text-orange-700", line: "bg-orange-400" },
  cyan: { header: "bg-cyan-600", bar: "bg-cyan-100", skill: "bg-cyan-100 text-cyan-700", line: "bg-cyan-400" },
};

function TemplateMiniPreview({ preview }) {
  const c = colorMap[preview];
  return (
    <div className="bg-white rounded-lg overflow-hidden h-48 border border-gray-100 flex flex-col text-[6px]">
      <div className={`${c.header} px-3 py-2`}>
        <div className="bg-white/40 h-2 w-20 rounded mb-1" />
        <div className="bg-white/25 h-1.5 w-14 rounded mb-1" />
        <div className="flex gap-2">
          <div className="bg-white/20 h-1 w-10 rounded" />
          <div className="bg-white/20 h-1 w-10 rounded" />
        </div>
      </div>
      <div className="px-3 py-2 flex-1 space-y-2">
        <div>
          <div className={`${c.line} h-0.5 w-8 rounded mb-1`} />
          <div className="bg-gray-200 h-1 w-full rounded mb-0.5" />
          <div className="bg-gray-100 h-1 w-5/6 rounded" />
        </div>
        <div>
          <div className={`${c.line} h-0.5 w-8 rounded mb-1`} />
          <div className="space-y-0.5">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-gray-200 h-1 w-16 rounded" />
                <div className="bg-gray-100 h-1 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className={`${c.line} h-0.5 w-8 rounded mb-1`} />
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${c.skill} h-1.5 w-6 rounded`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesGallery() {
  const navigate = useNavigate();

  return (
    <section id="templates" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Templates</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Professional Resume Templates
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every template is crafted to pass ATS scanners and impress hiring managers. Pick one and customize it in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/builder?template=${t.id}`)}
            >
              <div className="p-4 bg-gray-50">
                <TemplateMiniPreview preview={t.preview} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.tagColor}`}>
                    {t.tag}
                  </span>
                </div>
                <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Use This
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/builder")}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Start Building for Free
          </button>
        </div>
      </div>
    </section>
  );
}

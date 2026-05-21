import { useState } from "react";
import { useResume } from "../../../context/ResumeContext";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const empty = () => ({ name: "", issuer: "", year: "", url: "" });

export default function CertificationsForm() {
  const { resume, updateCertifications } = useResume();
  const certs = resume.certifications || [];
  const [expanded, setExpanded] = useState(null);

  const add = () => {
    const updated = [...certs, empty()];
    updateCertifications(updated);
    setExpanded(updated.length - 1);
  };

  const remove = (i) => {
    updateCertifications(certs.filter((_, idx) => idx !== i));
    setExpanded(null);
  };

  const update = (i, field, value) =>
    updateCertifications(certs.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 text-base">Certifications</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Add certificates, courses, or licenses you've earned.
        </p>
      </div>

      {certs.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-400 mb-3">No certifications yet</p>
          <button
            onClick={add}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
        </div>
      )}

      <div className="space-y-3">
        {certs.map((cert, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="font-medium text-gray-800 text-sm truncate text-left">
                {cert.name || `Certification ${i + 1}`}
              </span>
              {expanded === i ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {expanded === i && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                <div className="pt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="e.g. AWS Solutions Architect"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => update(i, "issuer", e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Year Earned
                  </label>
                  <input
                    type="text"
                    value={cert.year}
                    onChange={(e) => update(i, "year", e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Credential URL (optional)
                  </label>
                  <input
                    type="url"
                    value={cert.url}
                    onChange={(e) => update(i, "url", e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <button
                  onClick={() => remove(i)}
                  className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm transition-colors mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {certs.length > 0 && (
        <button
          onClick={add}
          className="flex items-center gap-1.5 border border-dashed border-gray-300 text-gray-600 px-4 py-2.5 rounded-xl text-sm hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Another Certification
        </button>
      )}
    </div>
  );
}

import { useRef, useState } from 'react';
import { Trash2, Pencil, Bookmark, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import FormField from '../FormField';

export default function PersonalInfoForm({ onNext }) {
  const { resume, updatePersonalInfo } = useResume();
  const p = resume.personalInfo;
  const fileRef = useRef(null);
  const [showExtra, setShowExtra] = useState(false);

  const set = (k, v) => updatePersonalInfo({ [k]: v });

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('photo', ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Please enter your{' '}
        <span className="text-blue-500">contact</span> info
      </h1>
      <p className="text-gray-500 mb-8">
        Add your phone number and email so recruiters can reach you.
      </p>

      {/* Photo upload */}
      <div className="flex items-start gap-4 mb-7">
        <div className="relative">
          {p.photo ? (
            <img
              src={p.photo}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center leading-snug px-1">
              Upload Photo
            </div>
          )}
          {p.photo && (
            <button
              onClick={() => set('photo', null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Bookmark className="w-4 h-4" /> My Photos
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <FormField label="First Name" mandatory value={p.firstName} onChange={(v) => set('firstName', v)} />
        <FormField label="Last Name" mandatory value={p.lastName} onChange={(v) => set('lastName', v)} />
        <FormField label="Job Title" value={p.jobTitle} onChange={(v) => set('jobTitle', v)} className="col-span-2" />
        <FormField label="Address" value={p.address} onChange={(v) => set('address', v)} className="col-span-2" />
        <FormField label="City" value={p.city} onChange={(v) => set('city', v)} />
        <FormField label="Postal Code" value={p.postalCode} onChange={(v) => set('postalCode', v)} />
        <FormField
          label="Phone"
          value={p.phone}
          onChange={(v) => set('phone', v)}
          placeholder="+91 9876543210"
        />
        <FormField
          label="Email"
          mandatory
          type="email"
          value={p.email}
          onChange={(v) => set('email', v)}
          placeholder="name@email.com"
        />
      </div>

      {/* Add more details */}
      <button
        onClick={() => setShowExtra(!showExtra)}
        className="flex items-center gap-1 text-blue-600 font-medium text-sm mb-4 hover:text-blue-700"
      >
        {showExtra ? 'Hide details' : 'Add more details'}
        {showExtra ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showExtra && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <FormField label="Country" value={p.country} onChange={(v) => set('country', v)} />
          <FormField label="Website" value={p.website} onChange={(v) => set('website', v)} />
          <FormField label="LinkedIn" value={p.linkedin} onChange={(v) => set('linkedin', v)} className="col-span-2" />
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Next to Experience →
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Search } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const SALARY_DATA = {
  'Software Engineer': { us: { min: 95000, mid: 130000, max: 180000 }, uk: { min: 45000, mid: 65000, max: 95000 }, india: { min: 800000, mid: 1500000, max: 2800000 }, remote: { min: 80000, mid: 120000, max: 170000 } },
  'Senior Software Engineer': { us: { min: 140000, mid: 180000, max: 250000 }, uk: { min: 70000, mid: 95000, max: 140000 }, india: { min: 1800000, mid: 3000000, max: 5000000 }, remote: { min: 120000, mid: 160000, max: 220000 } },
  'Frontend Developer': { us: { min: 85000, mid: 115000, max: 160000 }, uk: { min: 40000, mid: 58000, max: 85000 }, india: { min: 600000, mid: 1200000, max: 2200000 }, remote: { min: 70000, mid: 105000, max: 150000 } },
  'Backend Developer': { us: { min: 90000, mid: 125000, max: 170000 }, uk: { min: 42000, mid: 62000, max: 92000 }, india: { min: 700000, mid: 1400000, max: 2600000 }, remote: { min: 75000, mid: 115000, max: 160000 } },
  'Full Stack Developer': { us: { min: 95000, mid: 128000, max: 175000 }, uk: { min: 44000, mid: 64000, max: 95000 }, india: { min: 750000, mid: 1500000, max: 2800000 }, remote: { min: 80000, mid: 118000, max: 165000 } },
  'DevOps Engineer': { us: { min: 100000, mid: 140000, max: 195000 }, uk: { min: 50000, mid: 72000, max: 105000 }, india: { min: 900000, mid: 1800000, max: 3200000 }, remote: { min: 90000, mid: 130000, max: 185000 } },
  'Data Scientist': { us: { min: 105000, mid: 145000, max: 200000 }, uk: { min: 48000, mid: 70000, max: 105000 }, india: { min: 1000000, mid: 2000000, max: 3800000 }, remote: { min: 95000, mid: 135000, max: 190000 } },
  'Data Analyst': { us: { min: 65000, mid: 90000, max: 130000 }, uk: { min: 30000, mid: 45000, max: 68000 }, india: { min: 500000, mid: 900000, max: 1800000 }, remote: { min: 55000, mid: 82000, max: 120000 } },
  'Machine Learning Engineer': { us: { min: 130000, mid: 175000, max: 250000 }, uk: { min: 60000, mid: 88000, max: 130000 }, india: { min: 1500000, mid: 2800000, max: 5000000 }, remote: { min: 120000, mid: 160000, max: 230000 } },
  'Product Manager': { us: { min: 110000, mid: 155000, max: 220000 }, uk: { min: 52000, mid: 78000, max: 120000 }, india: { min: 1200000, mid: 2500000, max: 4500000 }, remote: { min: 100000, mid: 145000, max: 210000 } },
  'UX Designer': { us: { min: 80000, mid: 110000, max: 155000 }, uk: { min: 38000, mid: 55000, max: 82000 }, india: { min: 600000, mid: 1100000, max: 2000000 }, remote: { min: 65000, mid: 98000, max: 140000 } },
  'Marketing Manager': { us: { min: 75000, mid: 105000, max: 155000 }, uk: { min: 35000, mid: 52000, max: 78000 }, india: { min: 700000, mid: 1400000, max: 2500000 }, remote: { min: 60000, mid: 92000, max: 135000 } },
  'Sales Representative': { us: { min: 55000, mid: 80000, max: 140000 }, uk: { min: 28000, mid: 42000, max: 75000 }, india: { min: 400000, mid: 800000, max: 1500000 }, remote: { min: 45000, mid: 72000, max: 120000 } },
  'Project Manager': { us: { min: 85000, mid: 115000, max: 165000 }, uk: { min: 40000, mid: 58000, max: 88000 }, india: { min: 800000, mid: 1600000, max: 3000000 }, remote: { min: 72000, mid: 105000, max: 155000 } },
  'HR Manager': { us: { min: 70000, mid: 98000, max: 145000 }, uk: { min: 35000, mid: 50000, max: 78000 }, india: { min: 600000, mid: 1200000, max: 2200000 }, remote: { min: 58000, mid: 85000, max: 130000 } },
  'Financial Analyst': { us: { min: 72000, mid: 98000, max: 145000 }, uk: { min: 35000, mid: 52000, max: 80000 }, india: { min: 600000, mid: 1200000, max: 2200000 }, remote: { min: 62000, mid: 88000, max: 132000 } },
  'Customer Success Manager': { us: { min: 70000, mid: 95000, max: 140000 }, uk: { min: 33000, mid: 48000, max: 72000 }, india: { min: 600000, mid: 1100000, max: 2000000 }, remote: { min: 58000, mid: 85000, max: 125000 } },
  'Graphic Designer': { us: { min: 55000, mid: 75000, max: 115000 }, uk: { min: 26000, mid: 38000, max: 58000 }, india: { min: 400000, mid: 700000, max: 1400000 }, remote: { min: 45000, mid: 68000, max: 105000 } },
  'Accountant': { us: { min: 60000, mid: 80000, max: 120000 }, uk: { min: 30000, mid: 44000, max: 68000 }, india: { min: 400000, mid: 800000, max: 1600000 }, remote: { min: 50000, mid: 72000, max: 110000 } },
  'Nurse': { us: { min: 60000, mid: 80000, max: 115000 }, uk: { min: 28000, mid: 38000, max: 55000 }, india: { min: 300000, mid: 600000, max: 1200000 }, remote: { min: 55000, mid: 72000, max: 105000 } },
  'Teacher': { us: { min: 42000, mid: 58000, max: 80000 }, uk: { min: 26000, mid: 38000, max: 55000 }, india: { min: 300000, mid: 550000, max: 1000000 }, remote: { min: 35000, mid: 52000, max: 78000 } },
};

const MARKETS = [
  { id: 'us', label: 'United States', currency: '$', symbol: 'USD' },
  { id: 'uk', label: 'United Kingdom', currency: '£', symbol: 'GBP' },
  { id: 'india', label: 'India', currency: '₹', symbol: 'INR' },
  { id: 'remote', label: 'Remote (Global)', currency: '$', symbol: 'USD' },
];

const fmt = (n, currency) => {
  if (n >= 1000000) return `${currency}${(n / 100000).toFixed(0)}L`;
  if (n >= 100000) return `${currency}${(n / 1000).toFixed(0)}k`;
  return `${currency}${(n / 1000).toFixed(0)}k`;
};

export default function SalaryInsightsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedMarket, setSelectedMarket] = useState('us');

  const market = MARKETS.find(m => m.id === selectedMarket);
  const data = SALARY_DATA[selectedRole]?.[selectedMarket];

  const filteredRoles = search
    ? Object.keys(SALARY_DATA).filter(r => r.toLowerCase().includes(search.toLowerCase()))
    : Object.keys(SALARY_DATA);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Salary Insights</h1>
            <p className="text-sm text-gray-500">Market salary ranges by role and location</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: role selector */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search roles…"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredRoles.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedRole === role ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Right: salary display */}
          <div className="lg:col-span-2 space-y-4">
            {/* Market selector */}
            <div className="flex gap-2 flex-wrap">
              {MARKETS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarket(m.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    selectedMarket === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Salary card */}
            {data && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRole}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{market?.label} · Annual base salary</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Visual bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Entry / Min</span>
                    <span>Median</span>
                    <span>Senior / Max</span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center">
                      <div className="h-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-700 rounded-full" style={{ width: '100%' }} />
                    </div>
                    {/* Median marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                      style={{ left: `${((data.mid - data.min) / (data.max - data.min)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm font-bold text-gray-700">{fmt(data.min, market.currency)}</span>
                    <span className="text-base font-black text-blue-700">{fmt(data.mid, market.currency)}/yr</span>
                    <span className="text-sm font-bold text-gray-700">{fmt(data.max, market.currency)}</span>
                  </div>
                </div>

                {/* 3 cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Entry Level', value: data.min, color: 'bg-gray-50 border-gray-200' },
                    { label: 'Median', value: data.mid, color: 'bg-blue-50 border-blue-200', highlight: true },
                    { label: 'Senior / Top', value: data.max, color: 'bg-indigo-50 border-indigo-200' },
                  ].map(item => (
                    <div key={item.label} className={`rounded-xl border p-3.5 text-center ${item.color}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                      <p className={`text-lg font-black ${item.highlight ? 'text-blue-700' : 'text-gray-800'}`}>
                        {fmt(item.value, market.currency)}
                      </p>
                      <p className="text-[10px] text-gray-400">{market.symbol}/year</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-gray-400 mt-4 text-center">
                  Data based on aggregated market reports (Glassdoor, LinkedIn, Levels.fyi). Actual salaries vary by company size, location, and experience.
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">Negotiation Tips</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Always negotiate — 84% of employers expect it. First offer is rarely the best offer.',
                  'Have a specific number, not a range. Whoever gives a range gets the lower end.',
                  'Research using Glassdoor, Levels.fyi, LinkedIn Salary, and Payscale.',
                  'Negotiate total comp: base, bonus, equity, PTO, WFH, and learning budget all have value.',
                  '"Is there any flexibility?" is the lowest-risk phrase to open a negotiation.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

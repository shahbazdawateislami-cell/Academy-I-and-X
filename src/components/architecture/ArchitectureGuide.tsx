import React from 'react';
import {
  Building2,
  Utensils,
  Users,
  ShieldCheck,
  Zap,
  GraduationCap,
  CheckCircle2,
  Workflow,
  HeartHandshake,
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Hero Box */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
            <Workflow className="w-4 h-4" />
            <span>Residential School System Blueprint</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            Residential School & Hostel Financial Operations Architecture
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Residential schools (boarding schools / madaris / residential academies) manage a dual financial reality: academic tuition administration combined with 24/7 hospitality and student welfare (dormitories, kitchen mess, healthcare, utilities). This platform streamlines fee reconciliation, per-student monthly cost audits, and departmental expenditure controls.
          </p>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1: Fee & Inflow Ingestion */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                01. Student Fee & Kafalah Sponsorship Inflows
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-channel receipt tracking and roll-wise reconciliation
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Fee payments are attributed to individual students, dormitories, or donor funds:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Hostel & Boarding Fees:</strong> Covers lodging, water, laundry, and dormitory amenities.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Academic Tuition & Admissions:</strong> Regular curriculum fees, exam registrations, and stationery.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Sponsorships (Kafalat-e-Talib-e-Ilm):</strong> Dedicated philanthropic funds for orphan and deserving boarders.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: Mess & Kitchen Operations */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                02. Student Mess & Kitchen Cost Monitoring
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bulk dry rations vs daily perishables
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            The mess is often the largest variable expenditure in a residential school:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Dry Ration Invoices:</strong> Monthly wholesale purchases of wheat flour (atta), rice, pulses, and cooking oil.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Daily/Bi-Weekly Perishables:</strong> Fresh milk, dairy, vegetables, halal meat, and bread.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Per-Student Food Cost:</strong> Tracks exact cost to nourish each boarder per day and month.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Faculty, Wardens & Utilities */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                03. Faculty Salaries & 24/7 Hostel Operations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staff payroll, power reliability, and dormitory upkeep
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Campus reliability requires structured budget envelopes:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Faculty & Staff Payroll:</strong> Teachers, chief wardens, night supervisors, cooks, and security guards.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Power & Utilities:</strong> Grid electricity, solar system upkeep, and standby generator diesel.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Dormitory Maintenance:</strong> Geyser repairs, plumbing, sanitization, and student clinic first aid.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 4: Board Audit & Reporting */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                04. Board of Trustees & Principal Monthly Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                One-click CSV statements and automated financial health rating
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Provides complete financial transparency for school management:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Cost Per Student Metric:</strong> Total Operating Outflow divided by total residential students.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>One-Click CSV Export:</strong> Audit-ready ledger export including student roll numbers and voucher IDs.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Surplus Reserve Protection:</strong> Ensures reserve funds remain positive for campus emergencies.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { listApplicants, createApplicant } from "@/api/applicants";
import Badge from "@/components/ui/Badge";
import type { KycStatus } from "@/types/kyc";
import type { Applicant } from "@/types/applicant";

// ── Create Applicant Modal ────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
}

function CreateApplicantModal({ onClose }: CreateModalProps) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [created, setCreated] = useState<Applicant | null>(null);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inviteUrl = created?.invite_url ?? null;


  const { mutate, isPending, error } = useMutation({
    mutationFn: createApplicant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      setCreated(data);
    },
    onError: (err: any) => {
      // Surface per-field validation errors from DRF
      const detail = err?.response?.data;
      if (detail && typeof detail === "object") {
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(detail)) {
          mapped[k] = Array.isArray(v) ? (v as string[]).join(" ") : String(v);
        }
        setFieldErrors(mapped);
      }
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.full_name = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email.";
    if (phone && !/^(\+254|07|01)\d{8,9}$/.test(phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid Kenyan phone number.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate({ full_name: fullName.trim(), email: email.trim(), phone: phone.trim() || undefined });
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray">
          <h2 className="text-lg font-display font-semibold text-charcoal">
            {created ? "Applicant Created" : "New Applicant"}
          </h2>
          <button
            onClick={onClose}
            className="text-medium-gray hover:text-charcoal transition-colors p-1 rounded-lg hover:bg-mint-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {!created ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Generic API error */}
              {error && !Object.keys(fieldErrors).length && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-body text-error">
                  Something went wrong. Please try again.
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-body font-medium text-charcoal mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Mwangi"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-body bg-off-white text-charcoal
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all
                    placeholder:text-medium-gray ${fieldErrors.full_name ? "border-error" : "border-light-gray"}`}
                />
                {fieldErrors.full_name && (
                  <p className="text-xs text-error mt-1">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-body font-medium text-charcoal mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-body bg-off-white text-charcoal
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all
                    placeholder:text-medium-gray ${fieldErrors.email ? "border-error" : "border-light-gray"}`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-error mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-body font-medium text-charcoal mb-1">
                  Phone <span className="text-medium-gray font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-body bg-off-white text-charcoal
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all
                    placeholder:text-medium-gray ${fieldErrors.phone ? "border-error" : "border-light-gray"}`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-error mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-body text-medium-gray hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-lime text-forest font-display font-semibold px-4 py-2 rounded-lg
                    hover:bg-lime-bright transition-colors duration-250 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? "Creating…" : "Create & Generate Link"}
                </button>
              </div>
            </form>
          ) : (
            // Success state — show invite link
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-mint-surface rounded-xl border border-forest/20">
                <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-off-white font-display font-bold flex-shrink-0">
                  {created.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-charcoal">{created.full_name}</p>
                  <p className="text-xs font-body text-medium-gray">{created.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-body font-medium text-charcoal mb-2">Invite Link</p>
                <div className="flex items-center gap-2 p-3 bg-off-white border border-light-gray rounded-lg">
                  <p className="text-xs font-mono text-forest flex-1 truncate">{inviteUrl}</p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-forest text-off-white rounded-md
                      text-xs font-body hover:bg-forest-mid transition-colors flex-shrink-0"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-xs font-body text-medium-gray mt-2">
                  Send this link to the applicant. It expires in 30 days.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  to={`/admin/applicants/${created.id}`}
                  className="flex items-center gap-1.5 text-xs font-body text-forest hover:text-forest-mid transition-colors"
                >
                  <ExternalLink size={13} />
                  View Applicant
                </Link>
                <button
                  onClick={onClose}
                  className="bg-lime text-forest font-display font-semibold px-4 py-2 rounded-lg
                    hover:bg-lime-bright transition-colors duration-250 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicantListPage() {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["applicants"],
    queryFn: () => listApplicants(),
  });

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-forest">Applicants</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-lime text-forest font-display font-semibold px-4 py-2 rounded-lg
              hover:bg-lime-bright transition-colors duration-250 text-sm"
          >
            + New Applicant
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-light-gray">
              <tr>
                {["Name", "Email", "KYC Status", "Created", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-body font-medium text-medium-gray uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-medium-gray font-body text-sm">
                    Loading…
                  </td>
                </tr>
              ) : !data?.results?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-sm font-body text-medium-gray">No applicants yet.</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-3 text-sm font-body text-forest hover:text-forest-mid transition-colors"
                    >
                      Create your first applicant →
                    </button>
                  </td>
                </tr>
              ) : (
                data.results.map((a: any) => (
                  <tr key={a.id} className="hover:bg-mint-surface transition-colors">
                    <td className="px-4 py-3 font-body font-medium text-charcoal">{a.full_name}</td>
                    <td className="px-4 py-3 text-medium-gray font-body">{a.email}</td>
                    <td className="px-4 py-3">
                      <Badge status={(a.kyc_status ?? "INCOMPLETE") as KycStatus} />
                    </td>
                    <td className="px-4 py-3 text-medium-gray font-body">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/applicants/${a.id}`}
                        className="text-forest hover:text-forest-mid font-medium text-xs transition-colors"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CreateApplicantModal onClose={() => setShowModal(false)} />}
    </>
  );
}
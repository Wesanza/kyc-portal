import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown, ChevronUp, Copy, Check, RefreshCw,
  Mail, FileText, ExternalLink, ShieldCheck, ArrowLeft,
  MapPin, Phone, Facebook, Instagram, AlertCircle,
  CheckCircle2, Clock, XCircle, RotateCcw, Eye, User,
} from "lucide-react";
import {
  getApplicant, getKycSummary, getKycSections,
  reviewSection, getReviewLog, resendInvite, regenerateInvite,
} from "@/api/applicants";
import { cn } from "@/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "sections" | "log" | "invite";

interface SectionData {
  section: string;
  label: string;
  status: string;
  submitted_at: string | null;
  reviewer_notes: string;
  data: any;
}

interface ReviewLogEntry {
  id: string;
  section_name: string;
  reviewer_name: string;
  old_status: string;
  new_status: string;
  notes: string;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** Resolve file_url → file → prepend API base if relative */
// function resolveFile(url?: string | null, path?: string | null): string | undefined {
//   const raw = url ?? path;
//   if (!raw) return undefined;
//   if (raw.startsWith("http")) return raw;
//   return `${API_BASE}${raw}`;
// }

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes(".pdf");
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED:        "Not Started",
  PENDING:            "Pending",
  IN_REVIEW:          "In Review",
  APPROVED:           "Approved",
  REJECTED:           "Rejected",
  REVISION_REQUESTED: "Revision Requested",
  INCOMPLETE:         "Incomplete",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  NOT_STARTED:        [],
  PENDING:            ["IN_REVIEW"],
  IN_REVIEW:          ["APPROVED", "REJECTED", "REVISION_REQUESTED"],
  REVISION_REQUESTED: ["IN_REVIEW"],
  REJECTED:           ["IN_REVIEW"],
  APPROVED:           ["IN_REVIEW"],
};

const STATUS_CONFIG: Record<string, { dot: string; badge: string; icon: React.ReactNode }> = {
  NOT_STARTED:        { dot: "bg-light-gray",  badge: "bg-light-gray text-medium-gray",    icon: <Clock className="w-3 h-3" /> },
  PENDING:            { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700",        icon: <Clock className="w-3 h-3" /> },
  IN_REVIEW:          { dot: "bg-info",        badge: "bg-blue-50 text-info",              icon: <Eye className="w-3 h-3" /> },
  APPROVED:           { dot: "bg-success",     badge: "bg-emerald-50 text-success",        icon: <CheckCircle2 className="w-3 h-3" /> },
  REJECTED:           { dot: "bg-error",       badge: "bg-red-50 text-error",              icon: <XCircle className="w-3 h-3" /> },
  REVISION_REQUESTED: { dot: "bg-warning",     badge: "bg-amber-50 text-warning",          icon: <RotateCcw className="w-3 h-3" /> },
  INCOMPLETE:         { dot: "bg-light-gray",  badge: "bg-light-gray text-medium-gray",    icon: <Clock className="w-3 h-3" /> },
};

const TRANSITION_CONFIG: Record<string, { label: string; className: string }> = {
  IN_REVIEW:          { label: "Mark In Review",   className: "border-blue-200 text-info hover:bg-blue-50" },
  APPROVED:           { label: "Approve",          className: "bg-forest text-off-white hover:bg-forest-mid border-transparent" },
  REJECTED:           { label: "Reject",           className: "border-red-200 text-error hover:bg-red-50" },
  REVISION_REQUESTED: { label: "Request Revision", className: "border-amber-200 text-warning hover:bg-amber-50" },
};

// ── Animations ────────────────────────────────────────────────────────────────
const AnimStyles = () => (
  <style>{`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes expandDown {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    .anim-slide-up { animation: slideUp    0.38s cubic-bezier(0.16,1,0.3,1) both; }
    .anim-fade-in  { animation: fadeIn     0.2s ease both; }
    .anim-expand   { animation: expandDown 0.22s cubic-bezier(0.16,1,0.3,1) both; }
    .stagger-1     { animation: slideUp    0.38s 0.05s cubic-bezier(0.16,1,0.3,1) both; }
    .stagger-2     { animation: slideUp    0.38s 0.10s cubic-bezier(0.16,1,0.3,1) both; }
    .stagger-3     { animation: slideUp    0.38s 0.16s cubic-bezier(0.16,1,0.3,1) both; }
    .skeleton {
      background: linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 8px;
    }
  `}</style>
);

// ── Status pill ───────────────────────────────────────────────────────────────
const StatusPill: React.FC<{ status: string; size?: "sm" | "md" }> = ({ status, size = "sm" }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NOT_STARTED;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-body font-semibold uppercase tracking-wide rounded-full",
      size === "sm" ? "text-[10px] px-2.5 py-1" : "text-xs px-3 py-1.5",
      cfg.badge
    )}>
      <span className={cn("rounded-full flex-shrink-0", size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2", cfg.dot)} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};

// ── Doc preview modal ─────────────────────────────────────────────────────────
const DocPreviewModal: React.FC<{ url: string; label: string; onClose: () => void }> = ({ url, label, onClose }) => {
  const pdf = isPdfUrl(url);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(pdf); // only need blob for PDFs

  useEffect(() => {
    if (!pdf) return;

    let objectUrl: string;
    fetch(url, { credentials: "include" })       // include cookies/session
      .then(r => r.blob())
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl); // cleanup on unmount
    };
  }, [url, pdf]);

  
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-charcoal/70 backdrop-blur-sm anim-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-off-white rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden anim-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-light-gray flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-mint-surface flex items-center justify-center">
              <FileText className="w-4 h-4 text-forest" />
            </div>
            <span className="text-sm font-display font-semibold text-charcoal">{label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-body font-medium text-forest hover:text-forest-mid px-2.5 py-1.5 rounded-lg hover:bg-mint-surface transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open tab
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-medium-gray hover:text-charcoal hover:bg-light-gray/60 transition-colors text-base leading-none font-light"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
          <div className="overflow-auto bg-light-gray/20 p-3">   {/* ← remove flex/min-h */}
            {loading && (
              <div className="flex items-center justify-center h-[70vh]">
                <RefreshCw className="w-5 h-5 animate-spin text-medium-gray" />
              </div>
            )}
            {!loading && pdf && blobUrl && (
              <iframe
                src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title={label}
                className="w-full rounded-xl border border-light-gray bg-white"
                style={{ height: "70vh" }}
              />
            )}
            {!loading && pdf && !blobUrl && (
              <div className="flex flex-col items-center justify-center gap-3 h-[70vh] text-medium-gray">
                <FileText className="w-8 h-8 opacity-30" />
                <p className="text-xs font-body">Couldn't load preview.</p>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-body text-forest underline">Open in new tab instead</a>
              </div>
            )}
            {!pdf && (
              <img src={url} alt={label} className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm mx-auto block" />
            )}
          </div>
        </div>
      </div>
    // </div>
  );
};

// ── File preview button ───────────────────────────────────────────────────────
const FilePreviewBtn: React.FC<{ label: string; url?: string }> = ({ label, url }) => {
  const [open, setOpen] = useState(false);

  if (!url) return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-body font-semibold text-medium-gray uppercase tracking-wide">{label}</span>
      <span className="text-xs font-body text-medium-gray italic">No file uploaded</span>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-body font-semibold text-medium-gray uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-forest bg-mint-surface hover:bg-forest/8 border border-forest-light/30 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-body text-medium-gray hover:text-charcoal px-2 py-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Open
          </a>
        </div>
      </div>
      {open && <DocPreviewModal url={url} label={label} onClose={() => setOpen(false)} />}
    </>
  );
};

// ── Data field ────────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-body font-semibold text-medium-gray uppercase tracking-wide">{label}</span>
      <span className="text-sm font-body text-charcoal">{value}</span>
    </div>
  );
};

// ── Section data renderer ─────────────────────────────────────────────────────
function SectionDataView({ section, data }: { section: string; data: any }) {
  if (!data) return <p className="text-xs font-body text-medium-gray italic py-1">No data submitted yet.</p>;

  switch (section) {
    case "employment_contract":
      return (
        <FilePreviewBtn
          label="Employment Contract"
          url={(data.file_url, data.file)}
        />
      );

    case "payslips":
      return (
        <div className="flex flex-col gap-2.5">
          {(data as any[]).map((p: any, i: number) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-3 bg-white rounded-xl border border-light-gray gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-display font-semibold text-charcoal">{p.month_label}</p>
                <span className={cn(
                  "text-[10px] font-body font-semibold px-2 py-0.5 rounded-full border w-fit",
                  p.is_certified
                    ? "bg-emerald-50 text-success border-emerald-200"
                    : "bg-amber-50 text-warning border-amber-200"
                )}>
                  {p.is_certified ? "✓ Certified" : "Uncertified"}
                </span>
              </div>
              <FilePreviewBtn
                label={`Payslip ${i + 1}`}
                url={(p.file_url, p.file)}
              />
            </div>
          ))}
        </div>
      );

    case "identity":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="KRA PIN Number"
            value={<span className="font-mono text-xs bg-mint-surface px-2 py-1 rounded-md">{data.kra_pin_number}</span>}
          />
          <Field
            label="National ID Number"
            value={<span className="font-mono text-xs bg-mint-surface px-2 py-1 rounded-md">{data.id_number}</span>}
          />
          <FilePreviewBtn label="KRA PIN Certificate" url={(data.kra_pin_file_url, data.kra_pin_file)} />
          <FilePreviewBtn label="National ID Document" url={(data.national_id_file_url, data.national_id_file)} />
        </div>
      );

    case "home_address":
    case "office_address":
      return (
        <div className="flex flex-col gap-3">
          <Field label="Address" value={data.address_text} />
          {data.latitude && (
            <Field
              label="Coordinates"
              value={<span className="font-mono text-xs bg-mint-surface px-2 py-1 rounded-md">{data.latitude}, {data.longitude}</span>}
            />
          )}
          {data.google_maps_pin_url && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-body font-semibold text-medium-gray uppercase tracking-wide">Google Maps</span>
              <a
                href={data.google_maps_pin_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-forest bg-mint-surface hover:bg-forest/8 border border-forest-light/30 px-2.5 py-1.5 rounded-lg w-fit transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Maps <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          )}
        </div>
      );

    case "social_media":
      return (
        <div className="flex flex-wrap gap-2.5">
          {data.facebook_url && (
            <a
              href={data.facebook_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Facebook className="w-3.5 h-3.5" /> Facebook <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
          {data.instagram_url && (
            <a
              href={data.instagram_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" /> Instagram <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
          {!data.facebook_url && !data.instagram_url && (
            <p className="text-xs font-body text-medium-gray italic">No social profiles provided.</p>
          )}
        </div>
      );

    case "contact_details":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Primary Phone"
            value={
              <a href={`tel:${data.phone_primary}`} className="inline-flex items-center gap-1.5 font-mono text-sm text-charcoal hover:text-forest transition-colors">
                <Phone className="w-3.5 h-3.5 text-forest" /> {data.phone_primary}
              </a>
            }
          />
          {data.phone_secondary && (
            <Field
              label="Secondary Phone"
              value={
                <a href={`tel:${data.phone_secondary}`} className="inline-flex items-center gap-1.5 font-mono text-sm text-charcoal hover:text-forest transition-colors">
                  <Phone className="w-3.5 h-3.5 text-medium-gray" /> {data.phone_secondary}
                </a>
              }
            />
          )}
        </div>
      );

    case "next_of_kin":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={data.full_name} />
          <Field
            label="Relationship"
            value={
              <span className="inline-flex items-center px-2.5 py-1 bg-mint-surface text-forest text-xs font-body font-semibold rounded-full">
                {data.relationship === "OTHER" ? data.relationship_other : data.relationship}
              </span>
            }
          />
          <Field
            label="Primary Phone"
            value={
              <a href={`tel:${data.phone_primary}`} className="font-mono text-sm text-charcoal hover:text-forest transition-colors">
                {data.phone_primary}
              </a>
            }
          />
          {data.phone_secondary && (
            <Field
              label="Secondary Phone"
              value={
                <a href={`tel:${data.phone_secondary}`} className="font-mono text-sm text-charcoal hover:text-forest transition-colors">
                  {data.phone_secondary}
                </a>
              }
            />
          )}
        </div>
      );

    default: return null;
  }
}

// ── Section accordion ─────────────────────────────────────────────────────────
function SectionAccordion({ section, applicantId }: { section: SectionData; applicantId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState(section.reviewer_notes ?? "");
  const [saved, setSaved] = useState(false);

  const allowedTransitions = VALID_TRANSITIONS[section.status] ?? [];
  const notesRequired = ["REJECTED", "REVISION_REQUESTED"].includes(selectedStatus ?? "");
  const canSubmit = !!selectedStatus && (!notesRequired || notes.trim().length > 0);

  const mutation = useMutation({
    mutationFn: () => reviewSection(applicantId, section.section, { status: selectedStatus!, reviewer_notes: notes }),
    onSuccess: () => {
      setSaved(true);
      setSelectedStatus(null);
      setTimeout(() => setSaved(false), 2500);
      queryClient.invalidateQueries({ queryKey: ["kyc-sections", applicantId] });
      queryClient.invalidateQueries({ queryKey: ["kyc-summary", applicantId] });
      queryClient.invalidateQueries({ queryKey: ["review-log", applicantId] });
    },
  });

  const borderClass =
    section.status === "APPROVED"              ? "border-emerald-200 bg-gradient-to-r from-emerald-50/20 to-white"
    : section.status === "REJECTED"            ? "border-l-[3px] border-l-error border-red-100 bg-white"
    : section.status === "REVISION_REQUESTED"  ? "border-l-[3px] border-l-warning border-amber-100 bg-white"
    : open                                     ? "border-forest/25 bg-white"
    : "border-light-gray bg-white hover:border-forest/20";

  return (
    <div className={cn("rounded-xl border overflow-hidden transition-all duration-200 shadow-card", borderClass)}>
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-mint-surface/50 transition-colors"
      >
        {/* <span className={cn("w-2 h-2 rounded-full flex-shrink-0", STATUS_CONFIG[section.status]?.dot ?? "bg-light-gray")} /> */}
        <span className="flex-1 text-sm font-display font-semibold text-charcoal">{section.label}</span>
        {section.submitted_at && (
          <span className="text-[11px] font-body text-medium-gray hidden sm:block tabular-nums">
            {new Date(section.submitted_at).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
          </span>
        )}
        <StatusPill status={section.status} />
        <span className="text-medium-gray flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-light-gray anim-expand">
          {/* Data area */}
          <div className="px-4 py-4 bg-mint-surface/50">
            <p className="text-[10px] font-body font-bold text-forest uppercase tracking-widest mb-3">Submitted Data</p>
            <SectionDataView section={section.section} data={section.data} />
          </div>

          {/* Review area */}
          <div className="px-4 py-4 border-t border-light-gray/60">
            <p className="text-[10px] font-body font-bold text-charcoal uppercase tracking-widest mb-3">Review Action</p>

            {/* Previous notes */}
            {section.reviewer_notes && (
              <div className="mb-3 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-body font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Previous Reviewer Notes</p>
                  <p className="text-xs font-body text-amber-800">{section.reviewer_notes}</p>
                </div>
              </div>
            )}

            {allowedTransitions.length === 0 ? (
              <p className="text-xs font-body text-medium-gray italic">
                {section.status === "NOT_STARTED"
                  ? "Applicant hasn't submitted this section yet."
                  : "No further transitions available from this status."}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions.map(t => {
                    const cfg = TRANSITION_CONFIG[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedStatus(selectedStatus === t ? null : t)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body font-semibold transition-all",
                          selectedStatus === t ? "ring-2 ring-offset-1 ring-forest/30 shadow-sm" : "",
                          cfg?.className ?? "border-light-gray text-charcoal hover:bg-mint-surface"
                        )}
                      >
                        {STATUS_CONFIG[t]?.icon}
                        {cfg?.label ?? STATUS_LABELS[t]}
                      </button>
                    );
                  })}
                </div>

                {/* Notes textarea */}
                {selectedStatus && (
                  <div className="anim-expand flex flex-col gap-1.5">
                    <label className="text-xs font-body font-medium text-charcoal">
                      Reviewer Notes {notesRequired && <span className="text-error ml-0.5">*</span>}
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      autoFocus
                      placeholder={notesRequired ? "Required — explain what needs correction…" : "Optional note visible to the applicant…"}
                      className="w-full px-3 py-2.5 rounded-lg border border-light-gray bg-off-white text-xs font-body text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest-light resize-none placeholder:text-medium-gray transition-all"
                    />
                  </div>
                )}

                {/* Submit row */}
                {selectedStatus && (
                  <div className="anim-expand flex items-center justify-between">
                    <button
                      onClick={() => setSelectedStatus(null)}
                      className="text-xs font-body text-medium-gray hover:text-charcoal transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => mutation.mutate()}
                      disabled={!canSubmit || mutation.isPending}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all",
                        canSubmit && !mutation.isPending
                          ? "bg-forest text-off-white hover:bg-forest-mid shadow-sm"
                          : "bg-light-gray text-medium-gray cursor-not-allowed"
                      )}
                    >
                      {saved
                        ? <><Check className="w-3.5 h-3.5" /> Saved</>
                        : mutation.isPending
                        ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                        : "Submit Review"}
                    </button>
                  </div>
                )}

                {mutation.isError && (
                  <p className="text-xs font-body text-error flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Failed to submit. Please try again.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Review log ────────────────────────────────────────────────────────────────
function ReviewLogTab({ applicantId }: { applicantId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["review-log", applicantId],
    queryFn: () => getReviewLog(applicantId),
  });

  if (isLoading) return (
    <div className="flex flex-col gap-3 py-2">
      {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
    </div>
  );

  if (!data?.results?.length) return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-medium-gray">
      <Clock className="w-8 h-8 opacity-30" />
      <p className="text-sm font-body">No review actions recorded yet.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {data.results.map((log: ReviewLogEntry, i: number) => (
        <div
          key={log.id}
          className="flex gap-3 p-4 bg-white border border-light-gray rounded-xl shadow-card"
          style={{ animation: `slideUp 0.3s ${i * 40}ms cubic-bezier(0.16,1,0.3,1) both` }}
        >
          <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-lime font-display font-bold text-sm flex-shrink-0">
            {log.reviewer_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-sm font-display font-semibold text-charcoal">{log.reviewer_name}</span>
              <span className="text-[11px] font-body text-medium-gray capitalize">
                · {log.section_name.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <StatusPill status={log.old_status} />
              <span className="text-medium-gray text-xs">→</span>
              <StatusPill status={log.new_status} />
            </div>
            {log.notes && (
              <p className="text-xs font-body text-charcoal bg-mint-surface border border-forest/10 rounded-lg px-2.5 py-1.5 mb-1.5">
                {log.notes}
              </p>
            )}
            <p className="text-[11px] font-body text-medium-gray">
              {new Date(log.created_at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Invite tab ────────────────────────────────────────────────────────────────
function InviteTab({ applicant }: { applicant: any }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const inviteUrl: string = applicant.invite_url ?? "";
  const inviteStatus: "ACTIVE" | "EXPIRED" | "USED" = applicant.invite_status ?? "ACTIVE";

  const statusStyle: Record<string, string> = {
    ACTIVE:  "bg-emerald-50 text-success border-emerald-200",
    EXPIRED: "bg-red-50 text-error border-red-200",
    USED:    "bg-light-gray text-medium-gray border-light-gray",
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resendMutation = useMutation({
    mutationFn: () => resendInvite(applicant.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applicant", applicant.id] }),
  });
  const regenerateMutation = useMutation({
    mutationFn: () => regenerateInvite(applicant.id),
    onSuccess: () => {
      setConfirmRegenerate(false);
      queryClient.invalidateQueries({ queryKey: ["applicant", applicant.id] });
    },
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Meta row */}
      <div className="grid grid-cols-3 gap-4 bg-white border border-light-gray rounded-xl p-4 shadow-card">
        <div>
          <p className="text-[10px] font-body font-semibold text-medium-gray uppercase tracking-wide mb-2">Status</p>
          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold border", statusStyle[inviteStatus])}>
            {inviteStatus}
          </span>
        </div>
        {applicant.invite_expires_at && (
          <div>
            <p className="text-[10px] font-body font-semibold text-medium-gray uppercase tracking-wide mb-2">Expires</p>
            <p className="text-xs font-body text-charcoal">{new Date(applicant.invite_expires_at).toLocaleDateString("en-KE")}</p>
          </div>
        )}
        {applicant.invite_sent_at && (
          <div>
            <p className="text-[10px] font-body font-semibold text-medium-gray uppercase tracking-wide mb-2">Last Sent</p>
            <p className="text-xs font-body text-charcoal">{new Date(applicant.invite_sent_at).toLocaleDateString("en-KE")}</p>
          </div>
        )}
      </div>

      {/* Invite link */}
      <div>
        <p className="text-xs font-body font-semibold text-charcoal mb-2">Invite Link</p>
        <div className="flex items-center gap-2 p-3 bg-white border border-light-gray rounded-xl shadow-card">
          <p className="text-xs font-mono text-forest flex-1 truncate min-w-0">{inviteUrl || "—"}</p>
          <button
            onClick={handleCopy}
            disabled={!inviteUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-forest text-off-white rounded-lg text-xs font-body font-semibold hover:bg-forest-mid transition-colors flex-shrink-0 disabled:opacity-40"
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
          className="flex items-center gap-2 px-3.5 py-2 border border-light-gray bg-white rounded-xl text-xs font-body font-medium text-charcoal hover:bg-mint-surface transition-colors disabled:opacity-50 shadow-card"
        >
          <Mail className="w-3.5 h-3.5" />
          {resendMutation.isPending ? "Sending…" : "Resend Email"}
        </button>

        {!confirmRegenerate ? (
          <button
            onClick={() => setConfirmRegenerate(true)}
            className="flex items-center gap-2 px-3.5 py-2 border border-red-200 rounded-xl text-xs font-body font-medium text-error hover:bg-red-50 transition-colors shadow-card"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate Link
          </button>
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 text-error flex-shrink-0" />
            <span className="text-xs font-body text-red-700">Invalidates current link. Sure?</span>
            <button
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
              className="px-2.5 py-1 bg-error text-white text-xs font-body font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {regenerateMutation.isPending ? "…" : "Yes"}
            </button>
            <button
              onClick={() => setConfirmRegenerate(false)}
              className="text-xs font-body text-medium-gray hover:text-charcoal transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {resendMutation.isSuccess && (
        <p className="text-xs font-body text-success flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Email queued for delivery.
        </p>
      )}
      {(resendMutation.isError || regenerateMutation.isError) && (
        <p className="text-xs font-body text-error flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> Action failed. Please try again.
        </p>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton h-36 w-full rounded-2xl" />
      <div className="skeleton h-72 w-full rounded-2xl" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("sections");

  const { data: applicant, isLoading: loadingApplicant } = useQuery({
    queryKey: ["applicant", id],
    queryFn: () => getApplicant(id!),
    enabled: !!id,
  });
  const { data: summary } = useQuery({
    queryKey: ["kyc-summary", id],
    queryFn: () => getKycSummary(id!),
    enabled: !!id,
  });
  const { data: sectionsData, isLoading: loadingSections } = useQuery({
    queryKey: ["kyc-sections", id],
    queryFn: () => getKycSections(id!),
    enabled: !!id,
  });

  if (loadingApplicant) return <><AnimStyles /><PageSkeleton /></>;
  if (!applicant) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm font-body text-error">Applicant not found.</p>
    </div>
  );

  const completionPct = summary?.completion_percentage ?? 0;
  const overallStatus = summary?.overall_status ?? "INCOMPLETE";

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "sections", label: "KYC Sections", count: sectionsData?.sections?.length },
    { id: "log",      label: "Review Log" },
    { id: "invite",   label: "Invite" },
  ];

  return (
    <>
      <AnimStyles />
      <div className="max-w-3xl mx-auto px-4 py-5 sm:py-6 pb-12 flex flex-col gap-4 sm:gap-5">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="anim-slide-up self-start flex items-center gap-1.5 text-xs font-body font-medium text-medium-gray hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to applicants
        </button>

        {/* ── Profile card ──────────────────────────────────────────────── */}
        <div className="stagger-1 bg-white rounded-2xl border border-light-gray shadow-card overflow-hidden">
          {/* Banner */}
          <div className="bg-forest px-5 sm:px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-lime flex items-center justify-center text-forest font-display font-bold text-xl flex-shrink-0 shadow-md">
              {applicant.full_name?.charAt(0)?.toUpperCase() ?? <User className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-display font-bold text-off-white truncate leading-tight">
                {applicant.full_name}
              </h1>
              <p className="text-xs sm:text-sm font-body text-off-white/60 truncate mt-0.5">{applicant.email}</p>
              {applicant.phone && (
                <p className="text-xs font-mono text-off-white/40 mt-0.5">{applicant.phone}</p>
              )}
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <StatusPill status={overallStatus} size="md" />
              <span className="text-[11px] font-body text-off-white/45 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-lime" /> {completionPct}% complete
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 sm:px-6 py-3 flex items-center gap-3 bg-mint-surface/50 border-t border-light-gray">
            <div className="flex-1 h-1.5 bg-light-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-lime rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs font-display font-bold text-forest tabular-nums w-10 text-right">
              {completionPct}%
            </span>
          </div>
        </div>

        {/* ── Tabs card ─────────────────────────────────────────────────── */}
        <div className="stagger-2 bg-white rounded-2xl border border-light-gray shadow-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-light-gray px-1 pt-1 gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-body font-semibold border-b-2 -mb-px transition-all rounded-t-lg",
                  activeTab === tab.id
                    ? "border-forest text-forest bg-mint-surface/60"
                    : "border-transparent text-medium-gray hover:text-charcoal hover:bg-light-gray/40"
                )}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={cn(
                    "text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full tabular-nums leading-none",
                    activeTab === tab.id ? "bg-forest text-off-white" : "bg-light-gray text-medium-gray"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-5">
            {activeTab === "sections" && (
              <div className="flex flex-col gap-2.5">
                {loadingSections
                  ? [1, 2, 3].map(i => <div key={i} className="skeleton h-14 w-full rounded-xl" />)
                  : sectionsData?.sections?.length
                  ? sectionsData.sections.map((s: SectionData) => (
                      <SectionAccordion key={s.section} section={s} applicantId={id!} />
                    ))
                  : (
                    <div className="flex flex-col items-center py-10 gap-2 text-medium-gray">
                      <FileText className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-body">No sections available.</p>
                    </div>
                  )
                }
              </div>
            )}
            {activeTab === "log"    && <ReviewLogTab applicantId={id!} />}
            {activeTab === "invite" && <InviteTab applicant={applicant} />}
          </div>
        </div>

      </div>
    </>
  );
}
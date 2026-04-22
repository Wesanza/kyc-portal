import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserPlus,
  ChevronRight,
  Layers,
} from "lucide-react";

import { listApplicants } from "@/api/applicants";
import { getReviewLog } from "@/api/reviews";
import { Card, CardHeader, CardBody, CardFooter, StatBadge } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { Avatar } from "@/components/ui/Avatar";
import ProgressBar from "@/components/ui/ProgressBar";
import type { ApplicantListResponse } from "@/types/applicant";
import type { ReviewLogListResponse } from "@/types/review";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deriveStats(data: ApplicantListResponse | undefined) {
  if (!data)
    return { total: 0, pending: 0, approved: 0, revision: 0, completionPct: 0 };
  const results = data.results ?? [];
  const total = data.count ?? 0;
  const approved = results.filter((a) => a.kyc_status === "APPROVED").length;
  const pending = results.filter(
    (a) => a.kyc_status === "IN_REVIEW" || a.kyc_status === "INCOMPLETE"
  ).length;
  const revision = results.filter(
    (a) =>
      a.kyc_status === "REVISION_REQUESTED" || a.kyc_status === "REJECTED"
  ).length;
  const completionPct =
    total > 0 ? Math.round((approved / total) * 100) : 0;
  return { total, pending, approved, revision, completionPct };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Metric Tile ─────────────────────────────────────────────────────────────
// Fully uses CardHeader (forest bg) + CardBody pattern

interface MetricTileProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  /** Badge trend indicator shown in the header */
  trend?: { value: string; dir: "up" | "down" | "neutral" };
  /** Sub-note rendered in CardFooter */
  sub?: string;
  onClick?: () => void;
}

function MetricTile({ label, value, icon, trend, sub, onClick }: MetricTileProps) {
  return (
    <Card hover onClick={onClick}>
      {/* Forest header — label + optional trend badge */}
      <CardHeader
        badge={
          trend ? (
            <StatBadge value={trend.value} trend={trend.dir} />
          ) : undefined
        }
        action={icon}
      >
        {label}
      </CardHeader>

      {/* Big number body */}
      <CardBody>
        <p
          className="text-[2.5rem] leading-none font-bold text-[#1a3d2e] tabular-nums mt-1 mb-0.5"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {value}
        </p>
        <p className="text-[11px] text-[#8a9e94]" style={{ fontFamily: "DM Sans, sans-serif" }}>
          vs. previous period
        </p>
      </CardBody>

      {/* Optional sub-note in footer */}
      {sub && (
        <CardFooter>
          <span className="text-[#2d7a1f] font-semibold">{sub}</span>
        </CardFooter>
      )}
    </Card>
  );
}

// ─── Arc Gauge ────────────────────────────────────────────────────────────────

function ArcGauge({ pct }: { pct: number }) {
  const r = 52, cx = 70, cy = 70;
  const startAngle = -220, endAngle = 40;
  const filled = (pct / 100) * (endAngle - startAngle);

  function arc(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(start: number, end: number) {
    const s = arc(start), e = arc(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  return (
    <svg width="140" height="110" viewBox="0 0 140 110" aria-hidden>
      <path
        d={describeArc(startAngle, endAngle)}
        fill="none" stroke="#d1e8da" strokeWidth="9" strokeLinecap="round"
      />
      <path
        d={describeArc(startAngle, startAngle + filled)}
        fill="none" stroke="#7fd957" strokeWidth="9" strokeLinecap="round"
        style={{ transition: "all 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
      <text
        x={cx} y={cy + 6} textAnchor="middle"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 22, fill: "#ffffff" }}
      >
        {pct}%
      </text>
      <text
        x={cx} y={cy + 20} textAnchor="middle"
        style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9, fill: "#a8c4b0", letterSpacing: "0.1em" }}
      >
        COMPLETE
      </text>
    </svg>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

interface ActivityRowProps {
  applicantName: string;
  sectionName: string;
  newStatus: string;
  reviewer: string;
  createdAt: string;
  onClick: () => void;
  index: number;
}

function ActivityRow({
  applicantName, sectionName, newStatus, reviewer, createdAt, onClick, index,
}: ActivityRowProps) {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 50 + 300}ms`, animationFillMode: "both" }}
      className="group w-full flex items-center gap-3 py-3 border-b border-[#f0f4f2] last:border-0
                 hover:bg-[#f7f9f8] -mx-4 px-4 transition-colors duration-200 text-left"
    >
      {/* Index dot */}
      <span className="shrink-0 w-6 h-6 rounded-full bg-[#e8f5e2] flex items-center justify-center">
        <span
          className="text-[10px] font-bold text-[#1a3d2e]"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {index + 1}
        </span>
      </span>

      <Avatar name={applicantName} className="shrink-0" size="sm" />

      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          {applicantName}
        </p>
        <p
          className="text-[11px] text-[#8a9e94] mt-0.5 truncate"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {sectionName.replace(/_/g, " ")} · {reviewer}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <Badge status={newStatus as any} />
        <span
          className="text-[10px] text-[#8a9e94]"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {timeAgo(createdAt)}
        </span>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-[#c8d8cc] group-hover:text-[#1a3d2e] shrink-0 transition-colors" />
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-[#f0f4f2] last:border-0">
          <SkeletonLoader className="w-6 h-6 rounded-full shrink-0" />
          <SkeletonLoader className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonLoader className="h-3 w-3/4 rounded" />
            <SkeletonLoader className="h-2.5 w-1/2 rounded" />
          </div>
          <SkeletonLoader className="w-16 h-5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Quick Filter ─────────────────────────────────────────────────────────────

interface QuickFilterProps {
  label: string;
  count: number | string;
  icon: React.ReactNode;
  iconColor: string;
  to: string;
  loading?: boolean;
}

function QuickFilter({ label, count, icon, iconColor, to, loading }: QuickFilterProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group flex items-center justify-between w-full rounded-lg px-3 py-2.5
                 bg-white border border-[#e2e8e4] hover:border-[#1a3d2e]
                 hover:bg-[#f7f9f8] transition-all duration-200"
    >
      <div className="flex items-center gap-2.5">
        <span className={`${iconColor} shrink-0`}>{icon}</span>
        <span
          className="text-[13px] font-medium text-[#1a1a1a] group-hover:text-[#1a3d2e] transition-colors"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!loading && (
          <span
            className="text-[11px] font-bold text-[#1a3d2e] bg-[#e8f5e2] px-2 py-0.5 rounded-md"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {count}
          </span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-[#c8d8cc] group-hover:text-[#1a3d2e] transition-colors" />
      </div>
    </button>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: applicantData, isLoading: loadingApplicants } =
    useQuery<ApplicantListResponse>({
      queryKey: ["applicants", { page_size: 100 }],
      queryFn: () => listApplicants({ page_size: 100 }),
    });

  const firstApplicantId = applicantData?.results?.[0]?.id;
  const { data: reviewLogData, isLoading: loadingLog } =
    useQuery<ReviewLogListResponse>({
      queryKey: ["review-log", firstApplicantId],
      queryFn: () => getReviewLog(firstApplicantId!),
      enabled: !!firstApplicantId,
    });

  const { total, pending, approved, revision, completionPct } =
    deriveStats(applicantData);
  const recentLog = reviewLogData?.results?.slice(0, 6) ?? [];

  return (
    <div className="min-h-full px-6 py-7" >

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="text-[10px] tracking-[0.15em] uppercase text-[#5a7264] mb-1"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            HR · Compliance
          </p>
          <h1
            className="text-[1.65rem] font-bold text-[#1a3d2e] leading-tight tracking-tight"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            KYC Dashboard
          </h1>
          <p
            className="text-[12px] text-[#5a7264] mt-0.5"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Monitor applicant verification status in real time
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/applicants")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7fd957] text-[#1a3d2e]
                     font-semibold hover:bg-[#6ec944] transition-colors duration-200 shadow-sm text-sm"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          New Applicant
        </button>
      </div>

      {/* ── Metric Tiles ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

        <MetricTile
          label="Total Applicants"
          value={loadingApplicants ? "—" : total}
          icon={<Users className="w-4 h-4 text-[#a8c4b0]" />}
          onClick={() => navigate("/admin/applicants")}
        />

        <MetricTile
          label="Pending Review"
          value={loadingApplicants ? "—" : pending}
          icon={<Clock className="w-4 h-4 text-[#f59e0b]" />}
          trend={pending > 0 ? { value: `${pending} active`, dir: "neutral" } : undefined}
          onClick={() => navigate("/admin/applicants?status=IN_REVIEW")}
        />

        <MetricTile
          label="Approved"
          value={loadingApplicants ? "—" : approved}
          icon={<CheckCircle2 className="w-4 h-4 text-[#7fd957]" />}
          trend={
            approved > 0
              ? { value: `${completionPct}%`, dir: "up" }
              : undefined
          }
          sub={approved > 0 ? `${completionPct}% completion rate` : undefined}
          onClick={() => navigate("/admin/applicants?status=APPROVED")}
        />

        <MetricTile
          label="Needs Attention"
          value={loadingApplicants ? "—" : revision}
          icon={<AlertTriangle className="w-4 h-4 text-[#ef4444]" />}
          trend={revision > 0 ? { value: `${revision} flagged`, dir: "down" } : undefined}
          onClick={() => navigate("/admin/applicants?status=REVISION_REQUESTED")}
        />
      </div>

      {/* ── Lower Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activity feed — 2 cols */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              action={
                <button
                  onClick={() => navigate("/admin/applicants")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#7fd957]
                             hover:opacity-80 transition-opacity uppercase tracking-wide"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              }
            >
              Recent Activity
            </CardHeader>

            <CardBody>
              {/* Sub-title inside body */}
              <p
                className="text-[11px] text-[#8a9e94] mb-3 -mt-1"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                Latest review actions across applicants
              </p>

              {loadingLog || loadingApplicants ? (
                <ActivitySkeleton />
              ) : recentLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e2] flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5 text-[#1a3d2e]" />
                  </div>
                  <p
                    className="text-[13px] font-semibold text-[#1a1a1a]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    No activity yet
                  </p>
                  <p
                    className="text-[11px] text-[#8a9e94] mt-1 max-w-[200px]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    Review actions will appear here once the process begins.
                  </p>
                </div>
              ) : (
                recentLog.map((log, i) => (
                  <ActivityRow
                    key={log.id}
                    index={i}
                    applicantName={(log as any).applicant_name ?? log.applicant}
                    sectionName={(log as any).section_name}
                    newStatus={log.new_status}
                    reviewer={(log as any).reviewer_name ?? log.reviewer}
                    createdAt={log.created_at}
                    onClick={() =>
                      navigate(`/admin/applicants/${log.applicant}`)
                    }
                  />
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Completion Rate — forest bg card */}
          <Card className="!bg-[#1a3d2e] !border-[#1a3d2e] relative overflow-hidden">
            {/* Decorative glow */}
            <div
              className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-20"
            />

            <CardHeader>
              {/* Override header bg inline for this inverted card */}
              <span className="text-[#a8c4b0]">Completion Rate</span>
            </CardHeader>

            <CardBody>
              <div className="flex justify-center mb-2">
                <ArcGauge pct={loadingApplicants ? 0 : completionPct} />
              </div>

              <ProgressBar
                value={loadingApplicants ? 0 : completionPct}
                className="h-1.5 !bg-[#2d5c40]"
              />

              <p
                className="text-[11px] text-[#a8c4b0] mt-3 text-center"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                {loadingApplicants
                  ? "—"
                  : `${approved} of ${total} applicants approved`}
              </p>
            </CardBody>
          </Card>

          {/* Quick Filters */}
          <Card>
            <CardHeader>Quick Filters</CardHeader>
            <CardBody className="flex flex-col gap-2">
              <QuickFilter
                label="Awaiting review"
                count={pending}
                icon={<Clock className="w-4 h-4" />}
                iconColor="text-[#f59e0b]"
                to="/admin/applicants?status=IN_REVIEW"
                loading={loadingApplicants}
              />
              <QuickFilter
                label="Needs revision"
                count={revision}
                icon={<RotateCcw className="w-4 h-4" />}
                iconColor="text-[#ef4444]"
                to="/admin/applicants?status=REVISION_REQUESTED"
                loading={loadingApplicants}
              />
              <QuickFilter
                label="Fully approved"
                count={approved}
                icon={<CheckCircle2 className="w-4 h-4" />}
                iconColor="text-[#7fd957]"
                to="/admin/applicants?status=APPROVED"
                loading={loadingApplicants}
              />
            </CardBody>
            <CardFooter>
              <span className="text-[#8a9e94]">
                {total} total applicants in system
              </span>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}
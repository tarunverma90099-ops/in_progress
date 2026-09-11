import {
  BellRing,
  BookOpenCheck,
  Building2,
  ChartColumn,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Timer,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/* ============================================================================
   Landing content
   ----------------------------------------------------------------------------
   Copy lives here (not inside JSX) so marketing can iterate without touching
   component code, and so later pages — dashboard empty states, email
   templates — can reuse the same vocabulary.
   ============================================================================ */

export interface NavLink {
  label: string;
  /** In-page anchor; `SiteNav` rewrites these to `/#…` off the landing page. */
  href: string;
  id: string;
}

export const navLinks: NavLink[] = [
  { label: "Features", href: "#features", id: "features" },
  { label: "Product", href: "#product", id: "product" },
  { label: "Roles", href: "#audiences", id: "audiences" },
  { label: "Stories", href: "#customers", id: "customers" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

export interface Institution {
  name: string;
  city: string;
  initials: string;
}

/** Illustrative deployments — replaced by real logos in production settings. */
export const institutions: Institution[] = [
  { name: "Brightwood Institute of Technology", city: "Pune", initials: "BIT" },
  { name: "Northgate College of Engineering", city: "Nagpur", initials: "NCE" },
  { name: "Sunridge College of Commerce", city: "Indore", initials: "SCC" },
  { name: "Vidyapuri Institute of Science", city: "Nashik", initials: "VIS" },
  { name: "Cedar Hill Polytechnic", city: "Dehradun", initials: "CHP" },
  { name: "Morningstar Degree College", city: "Raipur", initials: "MDC" },
  { name: "Lakeview Institute of Management", city: "Kochi", initials: "LIM" },
  { name: "Riverdale Public School", city: "Gurugram", initials: "RPS" },
];

export interface ProofStat {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  label: string;
  detail: string;
}

export const proofStats: ProofStat[] = [
  {
    value: 1.42,
    decimals: 2,
    suffix: "M",
    label: "check-ins marked",
    detail: "across the current academic session",
  },
  {
    value: 128,
    suffix: "+",
    label: "campuses live",
    detail: "colleges, schools and polytechnics",
  },
  {
    value: 41,
    suffix: "s",
    label: "median time to mark a class",
    detail: "for a 60-student lecture",
  },
  {
    value: 96,
    suffix: "%",
    label: "faculty adoption",
    detail: "within the first month of rollout",
  },
];

export interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  /** Accent token used for the icon tile. */
  accent: "brand" | "accent" | "amber" | "violet" | "emerald";
  /** Which miniature mock the card renders. */
  visual: "capture" | "analytics" | "alerts" | "reports" | "access";
  /** Bento sizing: wide cards span two columns on large screens. */
  span: "wide" | "narrow";
}

export const features: Feature[] = [
  {
    id: "capture",
    icon: ScanLine,
    title: "Attendance capture in 40 seconds flat",
    description:
      "Faculty open the class, a rotating QR goes on the projector and the room checks in from its phones. No roll call, no register, no arguing about who was actually there.",
    bullets: [
      "Rotating QR refreshes every 7 seconds — screenshots are useless",
      "Lightweight check-ins that work on 2G, with an offline queue",
      "Manual override for latecomers, always written to the audit log",
    ],
    accent: "brand",
    visual: "capture",
    span: "wide",
  },
  {
    id: "analytics",
    icon: ChartColumn,
    title: "Analytics your HoD actually opens",
    description:
      "Course, subject, section and student trends recompute the moment a session closes — with defaulters ranked before the shortage letter is drafted.",
    bullets: [
      "Attendance %, streak and trend for every enrolment",
      "Defaulter funnels by department, year and section",
      "Section-to-section comparison for the same course",
    ],
    accent: "accent",
    visual: "analytics",
    span: "wide",
  },
  {
    id: "alerts",
    icon: BellRing,
    title: "Alerts before the shortage, not after",
    description:
      "Threshold rules watch every enrolment and nudge the right people at 80%, 75% and 70% — students, mentors, parents and the HoD.",
    bullets: [
      "Email, SMS and WhatsApp Business templates",
      "Monday shortage digest per department",
      "Escalation to mentors when a nudge goes unread",
    ],
    accent: "amber",
    visual: "alerts",
    span: "narrow",
  },
  {
    id: "reports",
    icon: FileBarChart,
    title: "Reports that clear accreditation",
    description:
      "Registers, faculty compliance, hours taught and gap analysis generated from live data — not stitched together from seven spreadsheets.",
    bullets: [
      "One-click NAAC, AICTE and NBA annexure packs",
      "Signed monthly register PDF for the archive",
      "Scheduled delivery to the IQAC cell",
    ],
    accent: "violet",
    visual: "reports",
    span: "narrow",
  },
  {
    id: "access",
    icon: ShieldCheck,
    title: "Role-based access, end to end",
    description:
      "Admins, registrars, HoDs, faculty, class representatives and students each see their own slice — enforced server-side, with every change traceable.",
    bullets: [
      "Scoped permissions per role and department",
      "SSO with Google Workspace or Microsoft Entra ID",
      "Immutable audit log: who changed what, and when",
    ],
    accent: "emerald",
    visual: "access",
    span: "narrow",
  },
];

export interface ShowcaseTab {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  metric: { value: string; label: string };
  /** Which mock the panel renders. */
  mock: "capture" | "analyse" | "act" | "report";
}

export const showcaseTabs: ShowcaseTab[] = [
  {
    id: "capture",
    label: "Capture",
    icon: ScanLine,
    title: "One scan per lecture, 60 students in under a minute",
    description:
      "Faculty start a session straight from the timetable. The QR rotates, the roster fills in live, and anyone who missed the window can still be marked with a reason attached.",
    bullets: [
      "Start from the timetable — no app switching, no codes to read out",
      "Live counter shows 42/48 checked in as the room fills",
      "Network drop? Check-ins queue on the device and sync when it returns",
    ],
    metric: { value: "41 s", label: "median time to mark a 60-student lecture" },
    mock: "capture",
  },
  {
    id: "analyse",
    label: "Analyse",
    icon: LayoutDashboard,
    title: "Every subject, every student, one honest number",
    description:
      "Aggregates recompute when a session closes, so dashboards, defaulter lists and reports can never disagree. Drill from department to section to student to a single lecture.",
    bullets: [
      "Subject-wise percentage with streak and trend line",
      "Heatmap of sessions that consistently lose the most students",
      "Compare two sections teaching the same course",
    ],
    metric: { value: "6 weeks", label: "of prior registers re-imported in one upload" },
    mock: "analyse",
  },
  {
    id: "act",
    label: "Act",
    icon: Workflow,
    title: "Alerts, approvals and follow-ups in one inbox",
    description:
      "Leave requests, condonation appeals and shortage escalations land in the same triage queue mentors already open every Monday morning.",
    bullets: [
      "Approve leave and the record updates with the reason attached",
      "Auto-built intervention list for mentors and class tutors",
      "Parent digests configured per class, never per student",
    ],
    metric: { value: "−38%", label: "shortage cases after the first year" },
    mock: "act",
  },
  {
    id: "report",
    label: "Report",
    icon: ClipboardList,
    title: "Accreditation packs without the fire drill",
    description:
      "Registers, hours taught, faculty compliance and participation evidence — generated in the formats your council expects, on the schedule you set.",
    bullets: [
      "NAAC SSR, AICTE and NBA-ready annexures",
      "Signed monthly register PDF for the physical archive",
      "Excel, CSV and a REST API for the IQAC dashboard",
    ],
    metric: { value: "1 afternoon", label: "to assemble a full year of evidence" },
    mock: "report",
  },
];

export interface Audience {
  id: string;
  icon: LucideIcon;
  role: string;
  title: string;
  subtitle: string;
  points: string[];
  metric: { value: string; label: string };
  accent: "brand" | "accent" | "emerald";
}

export const audiences: Audience[] = [
  {
    id: "admins",
    icon: Building2,
    role: "College admins, registrars & IQAC",
    title: "One source of truth for the whole campus",
    subtitle:
      "Attendance compliance across every department, ready for the council, the auditor and the parent who calls on a Tuesday.",
    points: [
      "Department-level compliance view that updates live",
      "Eligibility gates for exam forms, scholarships and hostel seats at 75%",
      "Bulk staff onboarding from CSV with SSO provisioning",
      "Full export and audit trail for every data request",
    ],
    metric: { value: "100%", label: "of attendance evidence in one export" },
    accent: "brand",
  },
  {
    id: "faculty",
    icon: Users,
    role: "Faculty, HoDs & mentors",
    title: "Teach the first ten minutes instead of calling roll",
    subtitle:
      "Session launch, roster, leave approvals and shortage follow-ups in the same place you already take attendance.",
    points: [
      "Start a session from the timetable in two taps",
      "Roster, per-student history and CSV download at hand",
      "Approve leave with the reason attached to the record",
      "Mentor shortage list ready every Monday at 7 a.m.",
    ],
    metric: { value: "9 min", label: "saved per lecture — an hour a week per subject" },
    accent: "accent",
  },
  {
    id: "students",
    icon: GraduationCap,
    role: "Students & class representatives",
    title: "Know the number before the exam form does",
    subtitle:
      "A personal dashboard, an honest calendar and a leave workflow that doesn't need a paper slip signed in three offices.",
    points: [
      "Subject-wise percentage, updated the minute you check in",
      "Calendar of present, absent and approved-leave days",
      "Leave requests with proof, tracked from submission to approval",
      "\u201cWhat if I miss the next three classes?\u201d simulator",
    ],
    metric: { value: "Zero", label: "surprises at condonation season" },
    accent: "emerald",
  },
];

export interface Outcome {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const outcomes: Outcome[] = [
  { icon: Timer, value: "41 s", label: "median time to mark a 60-student lecture" },
  { icon: TrendingUp, value: "−38%", label: "shortage cases in the first year" },
  { icon: ShieldCheck, value: "99.98%", label: "session uptime across the session" },
  { icon: BookOpenCheck, value: "4.8/5", label: "faculty satisfaction, 2,180 reviews" },
];

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  org: string;
  initials: string;
  /** Featured quotes get the large tile. */
  featured?: boolean;
  stat?: { value: string; label: string };
}

export const testimonials: Testimonial[] = [
  {
    id: "faculty",
    quote:
      "I used to lose the first ten minutes of a 9 a.m. lecture to roll call. Now the QR is up before the projector warms and I start teaching. My first-year batch hasn't had a proxy entry all semester.",
    name: "Dr. Sweta Choubey",
    role: "Assistant Professor — Environmental Chemistry",
    org: "Department of Basic Science & Humanities",
    initials: "SC",
    stat: { value: "9 min", label: "returned to every lecture" },
  },
  {
    id: "hod",
    quote:
      "The Monday shortage digest reaches mentors automatically. We intervene in week four now instead of the week before the exam form goes out.",
    name: "Prof. Prashant Sahu",
    role: "Head of Department — Environmental Chemistry",
    org: "cgit raipur, chhattishgarh, india",
    initials: "PS",
  },
  {
    id: "student",
    quote:
      "I open the app after every lecture and my percentage has already moved. When I was heading for 72% in one subject I found out in October — not in December when the form was rejected.",
    name: "Tarun Verma",
    role: "B.Tech, Embedded Systems — 2nd year",
    org: "Student, roll no. 201",
    initials: "TV",
  },
  {
    id: "dean",
    quote:
      "Rollout took one staff meeting. 140 faculty were marking sessions the next morning, and I stopped chasing registers for the dean's report entirely.",
    name: "Dr. Shashi Bala Kindo",
    role: "lab assistent professor",
    org: "cgit raipur, chhattishgarh, india",
    initials: "SK",
    stat: { value: "140", label: "faculty onboarded in a day" },
  },
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    id: "setup",
    question: "How long does it take to go live on campus?",
    answer:
      "Most institutions are marking live sessions within a day. Upload your student and staff lists as CSV (or sync from your ERP), import the timetable, and faculty start sessions from the same screen they use for their roster. A typical 6-department rollout takes one staff meeting plus a 45-minute faculty orientation.",
  },
  {
    id: "proxy",
    question: "How does QR check-in stop proxy attendance?",
    answer:
      "The QR code rotates every seven seconds, so a screenshot is dead before it can be shared. Sessions can additionally be locked to the campus network or a geofence, and each check-in is bound to one device and one enrolment. Exceptions — latecomers, lost phones, lab conflicts — are marked by faculty with a reason, and every override is written to the audit log.",
  },
  {
    id: "hardware",
    question: "Do we need biometric devices, scanners or new hardware?",
    answer:
      "No. Faculty project the QR from any laptop or classroom display, and students use the browser on the phone they already carry. If you already have RFID readers or biometric terminals, Track Attend ingests their exports so those records live alongside everything else.",
  },
  {
    id: "shortage",
    question: "How does Track Attend help with the 75% attendance rule?",
    answer:
      "Every enrolment carries a live percentage with thresholds you set (we default to 80% warning, 75% shortage, 70% escalation). Students get a heads-up the week they slip, mentors get a weekly intervention list, and eligibility gates for exam forms, scholarships and hostels read the same number — so nothing is decided in a corridor.",
  },
  {
    id: "editing",
    question: "Who can change an attendance record?",
    answer:
      "Only roles you authorise, and only within their scope. Faculty can edit sessions they taught; HoDs can review corrections in their department; the registrar's office holds institution-wide rights. Corrections require a reason, retain the previous value, and appear in an immutable audit log with user, timestamp and IP.",
  },
  {
    id: "reports",
    question: "What exactly do we get for NAAC, AICTE and NBA visits?",
    answer:
      "Report packs built around the attendance criteria: department-wise compliance, subject-wise hours taught against sanctioned workload, defaulter intervention records, leave and condonation trails, plus signed monthly registers. Export as PDF for the archive, Excel for the IQAC cell, or pull it through the REST API into your own dashboard.",
  },
  {
    id: "integrations",
    question: "Will it work with our existing ERP and Google Classroom?",
    answer:
      "Yes. Students, staff and timetables sync from CSV or your ERP over REST; SSO runs through Google Workspace or Microsoft Entra ID; course rosters can mirror Google Classroom or Moodle. Our onboarding team does the mapping with you, usually in a single workshop.",
  },
  {
    id: "data",
    question: "Where is our data stored, and can we take it with us?",
    answer:
      "Indian institutions are hosted in the India region by default, encrypted in transit and at rest, with daily backups and per-tenant isolation. Larger institutions can choose on-premise or a private cloud deployment. You can export the full attendance history at any time — as CSV, Excel or JSON via the API — and we delete on request with a written confirmation.",
  },
  {
    id: "rollout",
    question: "Do we have to move the whole campus at once?",
    answer:
      "No — and we would rather you did not. Most institutions start with one department or one programme, run Track Attend beside their existing register for a semester, then expand once the numbers match. Rollout follows your academic calendar, so departments can join in the term that suits them, and any department can be added or paused mid-year.",
  },
];

export interface Integration {
  name: string;
  category: string;
}

export const integrations: Integration[] = [
  { name: "Google Workspace", category: "SSO & rosters" },
  { name: "Microsoft Entra ID", category: "SSO & SCIM" },
  { name: "Moodle", category: "LMS sync" },
  { name: "Google Classroom", category: "Course rosters" },
  { name: "WhatsApp Business", category: "Parent alerts" },
  { name: "Power BI", category: "Analytics export" },
];

export const contact = {
  supportEmail: "help@trackattend.app",
  phone: "+91 982 600 1234",
  address: "cgit boys hostel room 5, ground floor, cgit campus, raipur, chhattishgarh, india",
  hours: "Support 8 a.m. – 8 p.m. IST, Monday to Saturday",
};

export interface FooterColumn {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Attendance capture", href: "#features" },
      { label: "Product tour", href: "#product" },
      { label: "Analytics & alerts", href: "#features" },
      { label: "Reports & exports", href: "#features" },
      { label: "Implementation", href: "#faq" },
    ],
  },
  {
    title: "Who it's for",
    links: [
      { label: "Admins & registrars", href: "#audiences" },
      { label: "Faculty & HoDs", href: "#audiences" },
      { label: "Students & class reps", href: "#audiences" },
      { label: "Customer stories", href: "#customers" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Design system", href: "/design-system" },
      { label: "API health", href: "/api/health", external: true },
      { label: "Security & DPDP", href: "#faq" },
      { label: "FAQ", href: "#faq" },
    ],
  },
];

/** Small print under the hero CTAs — kept honest and short. */
export const heroTrustPoints = [
  { icon: Smartphone, label: "No hardware, no biometrics, no new devices" },
  { icon: Timer, label: "Live in a day, with your existing timetable" },
  { icon: ShieldCheck, label: "Hosted in India, DPDP-aligned, export anytime" },
];

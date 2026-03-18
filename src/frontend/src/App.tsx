import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ServiceId = "production" | "direction" | "full-project" | "songwriter";
type BookingServiceId =
  | "music"
  | "video-dir"
  | "video-edit"
  | "full"
  | "songwriter";

interface Product {
  id: string;
  title: string;
  price: string;
  gumroadUrl: string;
  tag: string;
}

interface TeamMember {
  initials: string;
  name: string;
  roles: string;
}
interface BookingEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  budget: string;
  timeline: string;
  status: "pending" | "in_progress" | "done";
  submittedAt: string;
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function loadBookings(): BookingEntry[] {
  try {
    return JSON.parse(localStorage.getItem("ea_bookings") || "[]");
  } catch {
    return [];
  }
}

function saveBooking(
  entry: Omit<BookingEntry, "id" | "status" | "submittedAt">,
) {
  const bookings = loadBookings();
  const newEntry: BookingEntry = {
    ...entry,
    id: Date.now().toString(),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  bookings.push(newEntry);
  localStorage.setItem("ea_bookings", JSON.stringify(bookings));
}

function updateBookingStatus(id: string, status: BookingEntry["status"]) {
  const bookings = loadBookings().map((b) =>
    b.id === id ? { ...b, status } : b,
  );
  localStorage.setItem("ea_bookings", JSON.stringify(bookings));
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: "🎵",
    title: "Music Production",
    description:
      "Professional beats, mixing & mastering by experienced producers who understand your vision.",
  },
  {
    icon: "✍️",
    title: "Songwriter",
    description:
      "Hire a Lyricist — custom lyrics and song concepts crafted to match your sound and vision.",
  },
  {
    icon: "🎬",
    title: "Video Director",
    description:
      "Cinematic music video concepts, storyboarding, and on-set direction for maximum impact.",
  },
  {
    icon: "✂️",
    title: "Video Editing",
    description:
      "Professional cuts, color grading, visual effects, and seamless post-production.",
  },
  {
    icon: "🚀",
    title: "Full Project",
    description:
      "End-to-end creative team — production, direction, editing — all in one package.",
  },
];

const _SERVICE_PILLS: { id: ServiceId; label: string }[] = [
  { id: "production", label: "Production" },
  { id: "direction", label: "Direction" },
  { id: "full-project", label: "Full Project" },
];

const _SERVICE_NAMES: Record<ServiceId, string> = {
  production: "Music Production",
  direction: "Video Director",
  "full-project": "Full Project",
  songwriter: "Songwriter",
};

const BOOKING_PILLS: { id: BookingServiceId; label: string }[] = [
  { id: "music", label: "Music Production" },
  { id: "songwriter", label: "Songwriter" },
  { id: "video-dir", label: "Video Director" },
  { id: "video-edit", label: "Video Editing" },
  { id: "full", label: "Full Project" },
];

const BOOKING_SERVICE_NAMES: Record<BookingServiceId, string> = {
  music: "Music Production",
  "video-dir": "Video Director",
  "video-edit": "Video Editing",
  full: "Full Project",
  songwriter: "Songwriter",
};

const _PRODUCTS: Product[] = [
  {
    id: "dark-trap",
    title: "Dark Trap Beat",
    price: "₹499",
    gumroadUrl: "https://gumroad.com/l/dark-trap-beat",
    tag: "Beat",
  },
  {
    id: "lofi-chill",
    title: "Lo-Fi Chill Beat",
    price: "₹399",
    gumroadUrl: "https://gumroad.com/l/lofi-chill-beat",
    tag: "Beat",
  },
  {
    id: "drill-sample",
    title: "Drill Sample Pack",
    price: "₹699",
    gumroadUrl: "https://gumroad.com/l/drill-sample-pack",
    tag: "Sample Pack",
  },
  {
    id: "vintage-soul",
    title: "Vintage Soul Pack",
    price: "₹599",
    gumroadUrl: "https://gumroad.com/l/vintage-soul-pack",
    tag: "Sample Pack",
  },
];

const TEAM: TeamMember[] = [
  {
    initials: "KK",
    name: "Kishan Kanhaiya",
    roles: "Music Producer · Singer · Songwriter",
  },
  {
    initials: "NK",
    name: "Nitin Kumar",
    roles: "Video Director · Editor · Videographer",
  },
];

const WA_LINK = "https://wa.me/919341240723";
const UPI_ID = "95257593";

// Build UPI deep link
function _buildUpiLink(price: string): string {
  const amount = price.replace(/[₹,]/g, "").trim();
  return `upi://pay?pa=${UPI_ID}&pn=Emerging%20Artist&am=${amount}&cu=INR`;
}

// ─── WhatsApp Icon ────────────────────────────────────────────────────────────
function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Card Icon ────────────────────────────────────────────────────────────────
function _CardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

// ─── Ripple Hook ─────────────────────────────────────────────────────────────
function useRipple() {
  const createRipple = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      const btn = e.currentTarget;
      const circle = document.createElement("span");
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const rect = btn.getBoundingClientRect();
      circle.style.cssText = `
        position: absolute;
        width: ${diameter}px;
        height: ${diameter}px;
        left: ${e.clientX - rect.left - diameter / 2}px;
        top: ${e.clientY - rect.top - diameter / 2}px;
        background: rgba(255,255,255,0.25);
        border-radius: 50%;
        pointer-events: none;
        animation: ripple 0.6s linear forwards;
      `;
      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(circle);
      circle.addEventListener("animationend", () => circle.remove());
    },
    [],
  );
  return createRipple;
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const createRipple = useRipple();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { id: "services", label: "Services" },
    { id: "store", label: "Store" },
    { id: "booking", label: "Booking" },
    { id: "team", label: "Team" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(31,46,69,0.6)",
      }}
    >
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <span
          className="font-display font-bold text-lg select-none"
          style={{
            background: "linear-gradient(135deg,#06B6D4,#2563EB)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Emerging Artist
        </span>

        <ul className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                data-ocid={`nav.${item.id}.link`}
                className="nav-link capitalize cursor-pointer bg-transparent border-none p-0"
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="nav.whatsapp.button"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold btn-cyan"
            onClick={createRipple}
          >
            Contact Us
          </a>
          <button
            type="button"
            className="md:hidden text-white p-1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="md:hidden px-5 pb-4"
          style={{ background: "rgba(15,23,42,0.95)" }}
        >
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className="block w-full text-left py-3 nav-link capitalize border-b bg-transparent"
              style={{ borderColor: "#1F2E45" }}
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold btn-cyan"
          >
            Contact Us
          </a>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const createRipple = useRipple();
  return (
    <section
      className="hero-bg min-h-[92vh] flex flex-col items-center justify-center text-center px-5 pt-20 pb-24"
      id="hero"
    >
      <div className="relative z-10 max-w-3xl mx-auto">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 animate-fade-in-up"
          style={{
            background: "rgba(6,182,212,0.12)",
            color: "#06B6D4",
            border: "1px solid rgba(6,182,212,0.3)",
          }}
        >
          🎵 For Rising Artists Everywhere
        </span>
        <h1
          className="font-display font-black mb-5 leading-tight animate-fade-in-up-delay-1"
          style={{ fontSize: "clamp(38px,7vw,72px)" }}
        >
          <span className="gradient-text-cyan">Create.</span>{" "}
          <span style={{ color: "#EAF2FF" }}>Collaborate.</span>{" "}
          <span className="gradient-text-cyan">Release.</span>
        </h1>
        <p
          className="section-sub max-w-xl mx-auto mb-10 animate-fade-in-up-delay-2"
          style={{ fontSize: "17px" }}
        >
          Connect with professional music producers, video directors, and
          creative teams. Bring your musical vision to life — from first idea to
          final release.
        </p>
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up-delay-3">
          <button
            type="button"
            data-ocid="hero.primary_button"
            className="px-8 py-3.5 rounded-full text-white font-bold text-base btn-cyan"
            onClick={(e) => {
              createRipple(e);
              document
                .getElementById("project")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Start Your Project
          </button>
          <button
            type="button"
            data-ocid="hero.secondary_button"
            className="px-8 py-3.5 rounded-full font-bold text-base"
            style={{
              border: "1.5px solid rgba(6,182,212,0.4)",
              color: "#06B6D4",
              background: "transparent",
              transition: "all 0.3s",
            }}
            onClick={() =>
              document
                .getElementById("store")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Browse Store
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in-up-delay-4">
          {[
            { num: "200+", label: "Artists Served" },
            { num: "50+", label: "Beats Released" },
            { num: "100%", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-2xl gradient-text-cyan">
                {s.num}
              </div>
              <div className="text-sm mt-1" style={{ color: "#64748B" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services ────────────────────────────────────────────────────────────────
function Services() {
  return (
    <section
      id="services"
      className="py-24 px-5"
      style={{ background: "linear-gradient(180deg,#020617 0%,#0F172A 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(6,182,212,0.12)",
              color: "#06B6D4",
              border: "1px solid rgba(6,182,212,0.3)",
            }}
          >
            What We Offer
          </span>
          <h2 className="section-title">Our Services</h2>
          <p className="section-sub mt-3 max-w-md mx-auto">
            Everything you need to create, produce, and release your music — all
            under one roof.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((svc, i) => (
            <div
              key={svc.title}
              data-ocid={`services.item.${i + 1}`}
              className="card-dark rounded-2xl p-7"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
                style={{
                  background: "rgba(6,182,212,0.12)",
                  border: "1px solid rgba(6,182,212,0.2)",
                }}
              >
                {svc.icon}
              </div>
              <h3
                className="font-display font-semibold text-lg mb-2"
                style={{ color: "#EAF2FF" }}
              >
                {svc.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#94A3B8" }}
              >
                {svc.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Store ────────────────────────────────────────────────────────────────────
function Store() {
  const products = [
    {
      id: "dark-trap",
      title: "Dark Trap Beat",
      price: "₹499",
      gumroadUrl: "https://gumroad.com/l/dark-trap-beat",
      tag: "Beat",
    },
    {
      id: "lofi-chill",
      title: "Lo-Fi Chill Beat",
      price: "₹399",
      gumroadUrl: "https://gumroad.com/l/lofi-chill-beat",
      tag: "Beat",
    },
    {
      id: "drill-sample",
      title: "Drill Sample Pack",
      price: "₹699",
      gumroadUrl: "https://gumroad.com/l/drill-sample-pack",
      tag: "Sample Pack",
    },
    {
      id: "vintage-soul",
      title: "Vintage Soul Pack",
      price: "₹599",
      gumroadUrl: "https://gumroad.com/l/vintage-soul-pack",
      tag: "Sample Pack",
    },
  ];

  function buildUpiLink(price: string): string {
    const amount = price.replace(/[₹,]/g, "").trim();
    return `upi://pay?pa=95257593&pn=Emerging%20Artist&am=${amount}&cu=INR`;
  }

  return (
    <section
      id="store"
      className="py-24 px-5"
      style={{ background: "linear-gradient(180deg,#0F172A 0%,#020617 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(37,99,235,0.12)",
              color: "#60A5FA",
              border: "1px solid rgba(37,99,235,0.3)",
            }}
          >
            Digital Store
          </span>
          <h2 className="section-title">Beats &amp; Sample Packs</h2>
          <p className="section-sub mt-3 max-w-md mx-auto">
            Premium, ready-to-use beats and sample packs crafted by our
            producers. Instant download after purchase.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <div
              key={p.id}
              data-ocid={`store.item.${i + 1}`}
              className="card-dark rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(6,182,212,0.12)",
                    color: "#06B6D4",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  {p.tag}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#60A5FA" }}
                >
                  {p.price}
                </span>
              </div>
              <div
                className="w-full h-20 rounded-xl flex items-center justify-center text-3xl"
                style={{
                  background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.15)",
                }}
              >
                🎵
              </div>
              <h3
                className="font-display font-semibold text-base"
                style={{ color: "#EAF2FF" }}
              >
                {p.title}
              </h3>
              <div className="flex flex-col gap-2 mt-auto">
                <a
                  href={p.gumroadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`store.primary_button.${i + 1}`}
                  className="btn-primary text-center text-sm py-2.5 rounded-xl font-semibold"
                >
                  Buy Now
                </a>
                <a
                  href={buildUpiLink(p.price)}
                  data-ocid={`store.secondary_button.${i + 1}`}
                  className="btn-outline text-center text-sm py-2 rounded-xl font-medium"
                  style={{
                    color: "#94A3B8",
                    borderColor: "rgba(148,163,184,0.2)",
                  }}
                >
                  Pay via UPI
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Booking Section ──────────────────────────────────────────────────────────
function Booking() {
  const [bName, setBName] = useState("");
  const [bEmail, setBEmail] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bService, setBService] = useState<BookingServiceId | null>(null);
  const [bDesc, setBDesc] = useState("");
  const [bBudget, setBBudget] = useState("");
  const [bTimeline, setBTimeline] = useState("");
  const [bErrors, setBErrors] = useState<{ name?: string; email?: string }>({});
  const [bSubmitted, setBSubmitted] = useState(false);
  const createRipple = useRipple();

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { name?: string; email?: string } = {};
    if (!bName.trim()) errs.name = "Name is required.";
    if (!bEmail.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(bEmail))
      errs.email = "Valid email is required.";
    if (Object.keys(errs).length > 0) {
      setBErrors(errs);
      return;
    }
    setBErrors({});
    saveBooking({
      name: bName.trim(),
      email: bEmail.trim(),
      phone: bPhone.trim(),
      service: bService ? BOOKING_SERVICE_NAMES[bService] : "Not selected",
      description: bDesc.trim(),
      budget: bBudget,
      timeline: bTimeline,
    });
    setBSubmitted(true);
  };

  return (
    <section
      id="booking"
      className="py-24 px-5"
      style={{ background: "linear-gradient(180deg,#0F172A 0%,#020617 100%)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(6,182,212,0.12)",
              color: "#06B6D4",
              border: "1px solid rgba(6,182,212,0.3)",
            }}
          >
            Book a Session
          </span>
          <h2 className="section-title">Book Your Project</h2>
          <p className="section-sub mt-3">
            Fill in the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        {bSubmitted ? (
          <div
            data-ocid="booking.success_state"
            className="rounded-2xl p-10 text-center"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.3)",
            }}
          >
            <div className="text-5xl mb-4">🎶</div>
            <h3
              className="font-display font-bold text-xl mb-2"
              style={{ color: "#EAF2FF" }}
            >
              Booking Received!
            </h3>
            <p className="section-sub mb-6">
              Thanks <strong style={{ color: "#06B6D4" }}>{bName}</strong>! This
              is a free enquiry — we'll contact{" "}
              <strong style={{ color: "#06B6D4" }}>{bEmail}</strong> within 24
              hours to discuss your project.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="booking.whatsapp.button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm"
              style={{ background: "#25D366" }}
            >
              <WaIcon size={18} />
              Chat on WhatsApp
            </a>
          </div>
        ) : (
          <div className="card-dark rounded-2xl p-8">
            {/* Service selection pills */}
            <div className="mb-6">
              <p
                className="text-sm font-medium mb-3"
                style={{ color: "#94A3B8" }}
              >
                Select a Service:
              </p>
              <div className="flex flex-wrap gap-2">
                {BOOKING_PILLS.map((pill) => (
                  <button
                    type="button"
                    key={pill.id}
                    data-ocid={`booking.service.${pill.id}.toggle`}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      bService === pill.id ? "pill-active" : "pill-inactive"
                    }`}
                    onClick={(e) => {
                      createRipple(e);
                      setBService(pill.id);
                    }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
              {bService && (
                <p
                  className="mt-3 text-sm font-medium"
                  style={{ color: "#06B6D4" }}
                >
                  ✓ Selected: {BOOKING_SERVICE_NAMES[bService]}
                </p>
              )}
            </div>

            <form
              onSubmit={handleBookingSubmit}
              noValidate
              data-ocid="booking.modal"
            >
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="book-name"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "#94A3B8" }}
                  >
                    Your Name *
                  </label>
                  <input
                    id="book-name"
                    data-ocid="booking.name.input"
                    className={`input-dark ${bErrors.name ? "error" : ""}`}
                    placeholder="e.g. Rahul Sharma"
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                  />
                  {bErrors.name && (
                    <p
                      data-ocid="booking.name_error"
                      className="mt-1 text-xs"
                      style={{ color: "#EF4444" }}
                    >
                      {bErrors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="book-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "#94A3B8" }}
                  >
                    Email Address *
                  </label>
                  <input
                    id="book-email"
                    data-ocid="booking.email.input"
                    type="email"
                    className={`input-dark ${bErrors.email ? "error" : ""}`}
                    placeholder="you@example.com"
                    value={bEmail}
                    onChange={(e) => setBEmail(e.target.value)}
                  />
                  {bErrors.email && (
                    <p
                      data-ocid="booking.email_error"
                      className="mt-1 text-xs"
                      style={{ color: "#EF4444" }}
                    >
                      {bErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="book-phone"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "#94A3B8" }}
                  >
                    Phone Number{" "}
                    <span style={{ color: "#4B5563" }}>(optional)</span>
                  </label>
                  <input
                    id="book-phone"
                    data-ocid="booking.phone.input"
                    type="tel"
                    className="input-dark"
                    placeholder="e.g. +91 98765 43210"
                    value={bPhone}
                    onChange={(e) => setBPhone(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="book-desc"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "#94A3B8" }}
                  >
                    Project Description
                  </label>
                  <textarea
                    id="book-desc"
                    data-ocid="booking.description.textarea"
                    className="input-dark"
                    style={{ minHeight: "100px", resize: "vertical" }}
                    placeholder="Describe your project, style, references, or any special requirements..."
                    value={bDesc}
                    onChange={(e) => setBDesc(e.target.value)}
                  />
                </div>

                {/* Budget + Timeline row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="book-budget"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "#94A3B8" }}
                    >
                      Budget Range
                    </label>
                    <select
                      id="book-budget"
                      data-ocid="booking.budget.select"
                      className="input-dark"
                      value={bBudget}
                      onChange={(e) => setBBudget(e.target.value)}
                    >
                      <option value="" style={{ background: "#0F172A" }}>
                        Select budget
                      </option>
                      <option
                        value="under-5k"
                        style={{ background: "#0F172A" }}
                      >
                        Under ₹5,000
                      </option>
                      <option value="5k-15k" style={{ background: "#0F172A" }}>
                        ₹5,000–₹15,000
                      </option>
                      <option value="15k-50k" style={{ background: "#0F172A" }}>
                        ₹15,000–₹50,000
                      </option>
                      <option value="50k+" style={{ background: "#0F172A" }}>
                        ₹50,000+
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="book-timeline"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "#94A3B8" }}
                    >
                      Timeline
                    </label>
                    <select
                      id="book-timeline"
                      data-ocid="booking.timeline.select"
                      className="input-dark"
                      value={bTimeline}
                      onChange={(e) => setBTimeline(e.target.value)}
                    >
                      <option value="" style={{ background: "#0F172A" }}>
                        Select timeline
                      </option>
                      <option value="asap" style={{ background: "#0F172A" }}>
                        ASAP
                      </option>
                      <option
                        value="1-2-weeks"
                        style={{ background: "#0F172A" }}
                      >
                        1–2 Weeks
                      </option>
                      <option value="1-month" style={{ background: "#0F172A" }}>
                        1 Month
                      </option>
                      <option
                        value="flexible"
                        style={{ background: "#0F172A" }}
                      >
                        Flexible
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Free enquiry badge */}
              <div
                className="mt-5 flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(6,182,212,0.06)",
                  border: "1px solid rgba(6,182,212,0.15)",
                }}
              >
                <span className="text-lg">✉️</span>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  <strong style={{ color: "#06B6D4" }}>Free Enquiry</strong> —
                  No payment required. We'll review your request and reply
                  within 24 hours.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  data-ocid="booking.submit_button"
                  className="flex-1 py-3.5 rounded-full text-white font-bold text-sm btn-cyan"
                  onClick={createRipple}
                >
                  Submit Booking
                </button>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="booking.whatsapp_quick.button"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-bold text-sm"
                  style={{ background: "#25D366" }}
                >
                  <WaIcon size={16} />
                  Quick WhatsApp
                </a>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────
function Team() {
  return (
    <section
      id="team"
      className="py-24 px-5"
      style={{ background: "linear-gradient(180deg,#0F172A 0%,#020617 100%)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(6,182,212,0.12)",
              color: "#06B6D4",
              border: "1px solid rgba(6,182,212,0.3)",
            }}
          >
            The People Behind It
          </span>
          <h2 className="section-title">Meet the Team</h2>
          <p className="section-sub mt-3 max-w-md mx-auto">
            Experienced creatives dedicated to helping artists like you reach
            their full potential.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {TEAM.map((member, i) => (
            <div
              key={member.initials}
              data-ocid={`team.item.${i + 1}`}
              className="card-dark rounded-2xl p-8 text-center flex flex-col items-center gap-4"
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#06B6D4,#2563EB)",
                  boxShadow: "0 8px 32px rgba(6,182,212,0.35)",
                }}
                aria-label={`${member.name} avatar`}
              >
                <span
                  className="font-display font-black text-white"
                  style={{ fontSize: "32px", letterSpacing: "-1px" }}
                  aria-hidden="true"
                >
                  {member.initials}
                </span>
              </div>
              <div>
                <h3
                  className="font-display font-bold text-xl"
                  style={{ color: "#EAF2FF" }}
                >
                  {member.name}
                </h3>
                <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                  {member.roles}
                </p>
              </div>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid={`team.contact.${i + 1}.button`}
                className="px-5 py-2 rounded-full text-sm font-semibold"
                style={{
                  border: "1.5px solid rgba(6,182,212,0.35)",
                  color: "#06B6D4",
                  background: "transparent",
                  transition: "all 0.3s",
                }}
              >
                Get in Touch
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [clearConfirm, setClearConfirm] = useState(false);

  const refresh = () => setBookings(loadBookings());

  useEffect(() => {
    if (loggedIn) setBookings(loadBookings());
  }, [loggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleStatus = (id: string, status: BookingEntry["status"]) => {
    updateBookingStatus(id, status);
    refresh();
  };

  const handleClearAll = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    localStorage.removeItem("ea_bookings");
    setBookings([]);
    setClearConfirm(false);
  };

  const statusBadge = (status: BookingEntry["status"]) => {
    const styles: Record<BookingEntry["status"], React.CSSProperties> = {
      pending: { background: "#334155", color: "#94A3B8" },
      in_progress: { background: "#78350F", color: "#FCD34D" },
      done: { background: "#14532D", color: "#86EFAC" },
    };
    const labels = {
      pending: "Pending",
      in_progress: "In Progress",
      done: "Done",
    };
    return (
      <span
        style={{
          ...styles[status],
          padding: "2px 10px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {labels[status]}
      </span>
    );
  };

  if (!loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0F172A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#1E293B",
            borderRadius: "16px",
            padding: "40px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #1F2E45",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔐</div>
            <h2
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              Admin Access
            </h2>
            <p style={{ color: "#64748B", fontSize: "13px", marginTop: "6px" }}>
              Enter your password to continue
            </p>
          </div>
          <form onSubmit={handleLogin} data-ocid="admin.login.modal">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-ocid="admin.password.input"
              style={{
                width: "100%",
                background: "#0F172A",
                border: "1px solid #1F2E45",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "8px",
              }}
            />
            {error && (
              <p
                data-ocid="admin.login.error_state"
                style={{
                  color: "#F87171",
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              data-ocid="admin.login.submit_button"
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg,#06B6D4,#2563EB)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={onExit}
              data-ocid="admin.back.button"
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                border: "1px solid #1F2E45",
                borderRadius: "8px",
                color: "#64748B",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              ← Back to Site
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        color: "#fff",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#020617",
          borderBottom: "1px solid #1F2E45",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              background: "linear-gradient(135deg,#06B6D4,#2563EB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Emerging Artist
          </span>
          <span style={{ color: "#475569", fontSize: "13px" }}>
            / Admin Dashboard
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleClearAll}
            data-ocid="admin.clear_all.button"
            style={{
              padding: "8px 16px",
              background: clearConfirm ? "#7F1D1D" : "#1E293B",
              border: `1px solid ${clearConfirm ? "#EF4444" : "#1F2E45"}`,
              borderRadius: "8px",
              color: clearConfirm ? "#FCA5A5" : "#94A3B8",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {clearConfirm ? "Confirm Clear All?" : "Clear All"}
          </button>
          {clearConfirm && (
            <button
              type="button"
              onClick={() => setClearConfirm(false)}
              data-ocid="admin.clear_cancel.button"
              style={{
                padding: "8px 16px",
                background: "#1E293B",
                border: "1px solid #1F2E45",
                borderRadius: "8px",
                color: "#94A3B8",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onExit}
            data-ocid="admin.logout.button"
            style={{
              padding: "8px 16px",
              background: "#1E293B",
              border: "1px solid #1F2E45",
              borderRadius: "8px",
              color: "#06B6D4",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
              Booking Submissions
            </h1>
            <p style={{ color: "#64748B", fontSize: "13px", marginTop: "4px" }}>
              {bookings.length} total request{bookings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["pending", "in_progress", "done"] as const).map((s) => (
              <span key={s} style={{ fontSize: "11px", color: "#64748B" }}>
                {s === "pending" ? "⚪" : s === "in_progress" ? "🟡" : "🟢"}{" "}
                {bookings.filter((b) => b.status === s).length}
              </span>
            ))}
          </div>
        </div>

        {bookings.length === 0 ? (
          <div
            data-ocid="admin.submissions.empty_state"
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#1E293B",
              borderRadius: "16px",
              border: "1px solid #1F2E45",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <p style={{ color: "#64748B", fontSize: "15px" }}>
              No booking submissions yet.
            </p>
            <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>
              Submissions will appear here once clients fill out the booking
              form.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            data-ocid="admin.submissions.list"
          >
            {bookings.map((b, i) => (
              <div
                key={b.id}
                data-ocid={`admin.submissions.item.${i + 1}`}
                style={{
                  background: "#1E293B",
                  borderRadius: "12px",
                  border: "1px solid #1F2E45",
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: "16px" }}>
                        {b.name}
                      </span>
                      {statusBadge(b.status)}
                      <span
                        style={{
                          background: "#0F172A",
                          color: "#06B6D4",
                          padding: "2px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          border: "1px solid #1F2E45",
                        }}
                      >
                        {b.service}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        marginTop: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#94A3B8", fontSize: "13px" }}>
                        📧 {b.email}
                      </span>
                      {b.phone && (
                        <span style={{ color: "#94A3B8", fontSize: "13px" }}>
                          📱 {b.phone}
                        </span>
                      )}
                      <span style={{ color: "#475569", fontSize: "12px" }}>
                        🕐 {new Date(b.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleStatus(b.id, "in_progress")}
                      data-ocid={`admin.mark_inprogress.button.${i + 1}`}
                      disabled={b.status === "in_progress"}
                      style={{
                        padding: "7px 14px",
                        background:
                          b.status === "in_progress" ? "#292524" : "#1C1917",
                        border: "1px solid #78350F",
                        borderRadius: "8px",
                        color:
                          b.status === "in_progress" ? "#6B7280" : "#FCD34D",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor:
                          b.status === "in_progress" ? "default" : "pointer",
                        opacity: b.status === "in_progress" ? 0.5 : 1,
                        transition: "all 0.2s",
                      }}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatus(b.id, "done")}
                      data-ocid={`admin.mark_done.button.${i + 1}`}
                      disabled={b.status === "done"}
                      style={{
                        padding: "7px 14px",
                        background:
                          b.status === "done" ? "#14532D20" : "#052e16",
                        border: "1px solid #14532D",
                        borderRadius: "8px",
                        color: b.status === "done" ? "#6B7280" : "#86EFAC",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: b.status === "done" ? "default" : "pointer",
                        opacity: b.status === "done" ? 0.5 : 1,
                        transition: "all 0.2s",
                      }}
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
                {b.description && (
                  <p
                    style={{
                      color: "#94A3B8",
                      fontSize: "13px",
                      margin: "0 0 10px 0",
                      lineHeight: "1.5",
                      background: "#0F172A",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F2E45",
                    }}
                  >
                    {b.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {b.budget && (
                    <span style={{ color: "#64748B", fontSize: "12px" }}>
                      💰 Budget:{" "}
                      <span style={{ color: "#94A3B8" }}>{b.budget}</span>
                    </span>
                  )}
                  {b.timeline && (
                    <span style={{ color: "#64748B", fontSize: "12px" }}>
                      📅 Timeline:{" "}
                      <span style={{ color: "#94A3B8" }}>{b.timeline}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onAdminClick }: { onAdminClick: () => void }) {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  const footerLinks = [
    { id: "services", label: "Services" },
    { id: "store", label: "Store" },
    { id: "booking", label: "Booking" },
    { id: "team", label: "Team" },
  ];

  return (
    <footer
      className="py-12 px-5"
      style={{ background: "#020617", borderTop: "1px solid #1F2E45" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span
              className="font-display font-bold text-xl"
              style={{
                background: "linear-gradient(135deg,#06B6D4,#2563EB)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Emerging Artist
            </span>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>
              Create. Collaborate. Release.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <button
                type="button"
                key={link.id}
                data-ocid={`footer.${link.id}.link`}
                className="nav-link text-xs bg-transparent border-none"
                onClick={() =>
                  document
                    .getElementById(link.id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="text-center">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.whatsapp.button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold"
              style={{ background: "#25D366" }}
            >
              <WaIcon size={14} />
              WhatsApp Us
            </a>
          </div>
        </div>

        <div
          className="mt-8 pt-6 text-center"
          style={{ borderTop: "1px solid #1F2E45" }}
        >
          <p className="text-xs" style={{ color: "#475569" }}>
            © {year} Emerging Artist. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400"
              style={{ color: "#06B6D4" }}
            >
              caffeine.ai
            </a>
          </p>
          <button
            type="button"
            onClick={onAdminClick}
            data-ocid="footer.admin.link"
            style={{
              background: "none",
              border: "none",
              color: "#1E293B",
              fontSize: "11px",
              cursor: "pointer",
              marginTop: "8px",
              padding: "2px 6px",
              display: "inline-block",
            }}
          >
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating WhatsApp ────────────────────────────────────────────────────────
function FloatingWhatsApp() {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="wa.float.button"
      className="wa-float"
    >
      <span className="sr-only">Chat on WhatsApp</span>
      <svg
        aria-hidden="true"
        width="28"
        height="28"
        fill="white"
        viewBox="0 0 24 24"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

// ─── Scroll To Top ────────────────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      data-ocid="scroll.to.top.button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        bottom: "92px",
        right: "24px",
        zIndex: 999,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "linear-gradient(135deg,#06B6D4,#2563EB)",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(6,182,212,0.45)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [adminView, setAdminView] = useState(false);

  if (adminView) {
    return <AdminDashboard onExit={() => setAdminView(false)} />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg,#0F172A 0%,#020617 100%)" }}
    >
      <Nav />
      <main>
        <Hero />
        <Services />
        <Store />
        <Booking />
        <Team />
      </main>
      <Footer onAdminClick={() => setAdminView(true)} />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}

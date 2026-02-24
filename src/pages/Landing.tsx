import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Boxes,
  CloudCog,
  CreditCard,
  FolderSync,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const modules = [
  {
    title: 'Fast POS Checkout',
    description: 'Barcode-first selling, split payments, discounts, and instant e-receipts across every cashier lane.',
    icon: CreditCard,
  },
  {
    title: 'Live Inventory Control',
    description: 'Real-time stock updates, low-stock automation, and transfer workflows that keep branches in sync.',
    icon: Boxes,
  },
  {
    title: 'Multi-Branch Command',
    description: 'Track branch-level performance, pricing, and profitability from one central operations workspace.',
    icon: Globe2,
  },
  {
    title: 'Supplier & PO Automation',
    description: 'Smart purchase planning with supplier lead-time insights and receiving workflows built for scale.',
    icon: Truck,
  },
];

const advancedFeatures = [
  { label: 'Offline-ready POS with auto-sync', icon: FolderSync },
  { label: 'AI-driven demand forecasting', icon: Sparkles },
  { label: 'Role-based access and audit trails', icon: LockKeyhole },
  { label: 'Real-time branch health monitoring', icon: ShieldCheck },
  { label: 'Smart replenishment recommendations', icon: Workflow },
  { label: 'Automated alerts for stock risks', icon: BellRing },
  { label: 'Unified analytics dashboards', icon: BarChart3 },
  { label: 'Cloud-native data backups', icon: CloudCog },
];

const faqs = [
  {
    question: 'Can BentaFlow support multiple branches with separate inventories?',
    answer:
      'Yes. Each branch has dedicated inventory, sales, and team access controls while leadership gets unified performance visibility.',
  },
  {
    question: 'Is BentaFlow suitable for both small and large businesses?',
    answer:
      'Yes. BentaFlow is designed to scale from single-store operations to multi-branch brands with complex stock and procurement workflows.',
  },
  {
    question: 'Does BentaFlow include advanced POS and inventory features?',
    answer:
      'Yes. The platform includes modern POS, real-time inventory, purchase planning, branch analytics, and operational automations.',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f8f6]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0d7a58] border-t-transparent" />
      </div>
    );
  }

  if (user) {
    const nextPath = user.role === 'CASHIER' ? '/pos' : '/my-store';
    return <Navigate to={nextPath} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f4f8f6] text-[#0f2a25]" style={{ fontFamily: '"Manrope", sans-serif' }}>
      <div className="relative overflow-hidden landing-grid-bg">
        <div className="pointer-events-none absolute -top-32 right-[-120px] h-72 w-72 rounded-full bg-[#6ae3b2]/30 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-20 left-[-90px] h-56 w-56 rounded-full bg-[#7aa8ff]/20 blur-3xl animate-float [animation-delay:0.4s]" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f2a25] text-sm font-extrabold text-white">BF</span>
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#0f2a25]">BentaFlow</p>
              <p className="text-xs text-[#385d55]">POS + Inventory OS</p>
            </div>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-[#1d4e44] md:flex">
            <a href="#features" className="hover:text-[#0d7a58]">Features</a>
            <a href="#advanced" className="hover:text-[#0d7a58]">Advanced</a>
            <a href="#pricing" className="hover:text-[#0d7a58]">Plans</a>
            <a href="#faq" className="hover:text-[#0d7a58]">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-[#1d4e44] hover:bg-white/80">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-[#0d7a58] text-white hover:bg-[#0a6147]">
              <Link to="/signup">Start free</Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:pb-24 lg:pt-10">
          <div className="animate-rise space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0d7a58]/20 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0d7a58]">
              <Sparkles className="h-3.5 w-3.5" />
              Built for modern commerce teams
            </span>
            <h1 className="text-4xl font-bold leading-tight text-[#072c24] sm:text-5xl lg:text-6xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Run every branch, every sale, and every stock movement from one powerful platform.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[#285c52] sm:text-lg">
              BentaFlow is a multi-branch Point of Sale and inventory management platform designed for small and big business owners.
              It unifies checkout, stock control, purchasing, and analytics with advanced, up-to-date tools built for growth.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-[#0d7a58] text-white hover:bg-[#0a6147]">
                <Link to="/signup">
                  Create account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-[#0d7a58]/30 bg-white/70 text-[#12473e] hover:bg-white">
                <Link to="/login">See live dashboard</Link>
              </Button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#0d7a58]/15 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,42,37,0.06)]">
                <p className="text-2xl font-extrabold text-[#0c5f48]">99.95%</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#3e7066]">platform uptime</p>
              </div>
              <div className="rounded-2xl border border-[#0d7a58]/15 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,42,37,0.06)]">
                <p className="text-2xl font-extrabold text-[#0c5f48]">120ms</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#3e7066]">avg POS response</p>
              </div>
              <div className="rounded-2xl border border-[#0d7a58]/15 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,42,37,0.06)]">
                <p className="text-2xl font-extrabold text-[#0c5f48]">24/7</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#3e7066]">ops visibility</p>
              </div>
            </div>
          </div>

          <div className="relative animate-rise [animation-delay:0.2s]">
            <div className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-[#0d7a58]/20 via-transparent to-[#7aa8ff]/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_35px_90px_rgba(14,48,41,0.18)] backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#0d7a58]">Live operations view</p>
                <Store className="h-4 w-4 text-[#0d7a58]" />
              </div>
              <img
                src="/benta-flow.png"
                alt="BentaFlow dashboard preview"
                className="mb-5 w-full rounded-2xl border border-[#d2ece1] object-cover shadow-[0_12px_30px_rgba(15,42,37,0.08)]"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#ecfaf4] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2f6f60]">Today&apos;s Sales</p>
                  <p className="text-lg font-bold text-[#0a5d45]">PHP 198,420</p>
                </div>
                <div className="rounded-xl bg-[#f2f7ff] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#3b5f91]">Low Stock Alerts</p>
                  <p className="text-lg font-bold text-[#234f86]">12 flagged items</p>
                </div>
                <div className="rounded-xl bg-[#fff7e8] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8e6426]">Pending POs</p>
                  <p className="text-lg font-bold text-[#775116]">7 suppliers</p>
                </div>
                <div className="rounded-xl bg-[#f1f6f8] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#47626b]">Active Branches</p>
                  <p className="text-lg font-bold text-[#1f3b46]">18 locations</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0d7a58]">Core Platform</p>
            <h2 className="mt-2 text-3xl font-bold text-[#0b3129]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Everything you need from POS to inventory intelligence
            </h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {modules.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[#cee8de] bg-white p-6 shadow-[0_20px_45px_rgba(12,67,54,0.08)] transition-transform duration-300 hover:-translate-y-1"
            >
              <item.icon className="mb-4 h-6 w-6 text-[#0d7a58]" />
              <h3 className="mb-2 text-xl font-bold text-[#113e34]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {item.title}
              </h3>
              <p className="text-sm leading-7 text-[#2f6157]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="advanced" className="bg-[#092820] px-6 py-16 text-white lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7ee5bc]">Advanced & Up-to-Date</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-[#ecfff7]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Enterprise-grade features without enterprise complexity
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advancedFeatures.map((feature) => (
              <div key={feature.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <feature.icon className="mb-3 h-5 w-5 text-[#7ee5bc]" />
                <p className="text-sm font-semibold leading-6 text-[#d5f5e8]">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">
        <div className="rounded-[2rem] border border-[#c9e5da] bg-white p-8 shadow-[0_30px_70px_rgba(8,53,42,0.10)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0d7a58]">Flexible Plans</p>
              <h2 className="mt-2 text-3xl font-bold text-[#0f3a31]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Start lean. Scale fast. Keep your operations future-ready.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#325f54]">
                Launch with full POS and inventory workflows, then unlock advanced branch automation, analytics, and integrations as you grow.
              </p>
            </div>
            <div className="rounded-2xl bg-[#0d7a58] p-6 text-white shadow-[0_20px_50px_rgba(7,56,42,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#baf6dd]">Growth Plan</p>
              <p className="mt-3 text-4xl font-extrabold">PHP 2,490</p>
              <p className="text-sm text-[#d7f9ea]">per branch / month</p>
              <ul className="mt-5 space-y-2 text-sm text-[#eafff6]">
                <li>Full POS + inventory suite</li>
                <li>Advanced reporting and branch analytics</li>
                <li>Automated low-stock and replenishment rules</li>
                <li>Priority support and onboarding help</li>
              </ul>
              <Button asChild size="lg" className="mt-6 w-full bg-white text-[#0d7a58] hover:bg-[#e9fff5]">
                <Link to="/signup">Start with BentaFlow</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0d7a58]">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold text-[#0f3b31]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Answers for operators and owners
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#325f54]">
              Everything needed to launch quickly and run a high-performance retail operation with confidence.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-[#cfe9de] bg-white p-5 shadow-[0_12px_30px_rgba(9,58,46,0.08)]">
                <summary className="cursor-pointer list-none text-sm font-bold text-[#113e34]">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-[#355f55]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#cbe5db] bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-[#3f675e] lg:px-12">
          <p>© {new Date().getFullYear()} BentaFlow. Built for modern retail operations.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-[#0d7a58]">Sign in</Link>
            <Link to="/signup" className="hover:text-[#0d7a58]">Start free</Link>
            <a href="#features" className="hover:text-[#0d7a58]">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

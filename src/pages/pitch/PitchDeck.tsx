import {
  ArrowUpRightIcon,
  ChatsCircleIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ChartLineIcon,
  CheckCircleIcon,
  CoinsIcon,
  DeviceMobileIcon,
  FileTextIcon,
  FlagBannerIcon,
  GlobeIcon,
  GavelIcon,
  GlobeHemisphereWestIcon,
  HouseLineIcon,
  IdentificationBadgeIcon,
  LightningIcon,
  LightbulbFilamentIcon,
  LockSimpleIcon,
  MapTrifoldIcon,
  NetworkIcon,
  MegaphoneIcon,
  ShieldStarIcon,
  PresentationChartIcon,
  RocketLaunchIcon,
  ScalesIcon,
  ShieldCheckIcon,
  StackIcon,
  TargetIcon,
  SunHorizonIcon,
  TrendUpIcon,
  UsersIcon,
  UsersThreeIcon,
  WhatsappLogoIcon,
  LinkedinLogoIcon,
  TwitterLogoIcon,
} from "@phosphor-icons/react";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComponentProps, ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PitchDeck = () => {
  const businessModel = [
    {
      label: "Transaction Fees",
      description: "Primary & secondary property investments",
      fee: "1–3%",
    },
    {
      label: "Management Fees",
      description: "Annual fee on property value/rental income",
      fee: "0.5–1%",
    },
    {
      label: "Origination Fees",
      description: "Developers listing and onboarding projects",
      fee: "2%",
    },
    {
      label: "Secondary Trades",
      description: "Marketplace peer-to-peer token trades",
      fee: "1%",
    },
    {
      label: "Premium Services",
      description: "Advanced analytics & white-label partnerships",
      fee: "Variable",
    },
  ];

  const financials = [
    {
      year: "2025",
      users: "1,200",
      investments: "$0.1M",
      revenue: "$1.5K",
      ebitda: "-$50K",
    },
    {
      year: "2026",
      users: "10,000",
      investments: "$5M",
      revenue: "$100K",
      ebitda: "-$200K",
    },
    {
      year: "2027",
      users: "50,000",
      investments: "$20M",
      revenue: "$500K",
      ebitda: "+$50K",
    },
    {
      year: "2028",
      users: "120,000",
      investments: "$50M",
      revenue: "$1.3M",
      ebitda: "+$400K",
    },
    {
      year: "2029",
      users: "250,000",
      investments: "$120M",
      revenue: "$3M",
      ebitda: "+$1.5M",
    },
  ];

  const team: TeamMember[] = [
    {
      name: "Timothy Ofie",
      role: "CEO",
      bio: "Blockchain and real estate expert with over 10 years of experience in the industry.",
      socials: [
        {
          icon: LinkedinLogoIcon,
          href: "https://linkedin.com",
          label: "LinkedIn",
        },
        {
          icon: TwitterLogoIcon,
          href: "https://twitter.com",
          label: "Twitter",
        },
      ],
    },
  ];

  const advisors = [
    "Dr. Roland Igbinoba – Founder, PropCrowdy",
    "Olumide Soyombo – VC & Crowdfunding Association Chair",
    "ChainSecure Inc. – Smart Contract Auditors",
  ];

  const roadmap = [
    {
      year: "2026",
      milestones: [
        "Secure SEC crowdfunding licensing",
        "Launch PropChain mobile apps (iOS/Android)",
        "List 10+ properties; hit ₦1B cumulative investments",
      ],
    },
    {
      year: "2027",
      milestones: [
        "Launch PropChain Marketplace & Governance 2.0",
        "Reach ₦5B+ AUM and break-even profitability",
      ],
    },
    {
      year: "2028",
      milestones: [
        "Expand cross-border (diaspora, pan-African)",
        "Onboard institutions (pension, REICO)",
        "Launch PropChain Index Fund",
      ],
    },
  ];

  const tractionChartData = [
    { stage: "Pilot Launch", users: 200, investments: 5 },
    { stage: "Beta", users: 450, investments: 18 },
    { stage: "MVP", users: 800, investments: 40 },
    { stage: "Today", users: 1200, investments: 80 },
  ];

  const financialChartData = financials.map((item) => {
    const investmentsValue = parseFloat(item.investments.replace(/[$M]/g, ""));
    const revenueValue =
      parseFloat(item.revenue.replace(/[$MK+]/g, "")) /
      (item.revenue.includes("K") ? 1000 : 1);
    const ebitdaValue =
      parseFloat(item.ebitda.replace(/[$MK\-+]/g, "")) /
      (item.ebitda.includes("K") ? 1000 : 1);
    const ebitdaSign = item.ebitda.startsWith("-") ? -1 : 1;

    return {
      year: item.year,
      investments: investmentsValue,
      revenue: revenueValue,
      ebitda: ebitdaValue * ebitdaSign,
      investmentsLabel: item.investments,
      revenueLabel: item.revenue,
      ebitdaLabel: item.ebitda,
    };
  });

  const useOfFunds = [
    { name: "Product", value: 40 },
    { name: "Marketing", value: 25 },
    { name: "Operations", value: 20 },
    { name: "Reserve", value: 15 },
  ];

  const fundingColors = ["#7c3aed", "#22c55e", "#f97316", "#facc15"];

  const financialTooltipFormatter = (
    value: number,
    name: string,
    props: any
  ): [string, string] => {
    const labels: Record<string, string> = {
      Investments: props.payload.investmentsLabel,
      Revenue: props.payload.revenueLabel,
      EBITDA: props.payload.ebitdaLabel,
    };
    return [labels[name] ?? value.toString(), name];
  };

  const tractionTooltipFormatter = (
    value: number,
    name: string
  ): [string, string] => {
    if (name === "Investments") {
      return [`₦${value.toLocaleString()}M`, name];
    }
    return [`${value.toLocaleString()}`, name];
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="gap-1 text-xs uppercase tracking-wide"
              >
                <LightningIcon size={14} weight="fill" /> Pitch Deck
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                PropChain
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                Community-powered fractional real estate investment for
                Nigerians and the diaspora — “Own a piece of property, one token
                at a time.”
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <HouseLineIcon
                  size={18}
                  weight="fill"
                  className="text-primary"
                />
                <span>
                  Enabling co-ownership, rental yield, and community-led
                  decisions via Hedera DLT.
                </span>
              </div>
            </div>
            <div className="flex gap-3 md:flex-col md:items-end">
              <Button asChild variant="outline" className="gap-2">
                <a href="mailto:founders@propchain.ng">
                  <MegaphoneIcon size={18} weight="bold" /> Contact Founders
                </a>
              </Button>
              <Button asChild className="gap-2">
                <a
                  href="https://propchain-visuals.vercel.app/pitch"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ArrowUpRightIcon size={18} weight="bold" /> View Interactive
                  Deck
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12 pb-16">
        <Section
          icon={LightbulbFilamentIcon}
          title="The Problem"
          subtitle="Nigeria’s real estate is locked away from the majority"
        >
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                Homes cost ₦50–80M in major cities; 90% of citizens can’t clear
                the entry bar.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                Mortgage bottleneck: &lt;1% approval; borrowing rates north of
                18%.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                22M+ housing deficit; prices outpace wages while informal deals
                remain opaque and risky.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                No liquidity: investors must offload entire assets; average
                Nigerian needs 20+ years of savings.
              </span>
            </li>
          </ul>
        </Section>

        <Section
          icon={TrendUpIcon}
          title="The Solution"
          subtitle="Fractional ownership meets digital transparency"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureCard
              icon={CoinsIcon}
              title="Invest From ₦50k"
              description="Own verified property tokens — small, tradable units on Hedera."
            />
            <FeatureCard
              icon={ShieldCheckIcon}
              title="Automated Yields"
              description="Earn rent automatically; compliance and reporting handled by smart contracts."
            />
            <FeatureCard
              icon={LockSimpleIcon}
              title="Secure Escrow"
              description="Capital sits in trust until funding completes; investor first by design."
            />
            <FeatureCard
              icon={ChartLineIcon}
              title="Liquidity & Governance"
              description="Trade tokens peer-to-peer and vote on property decisions as a community."
            />
          </div>
        </Section>

        <Section
          icon={DeviceMobileIcon}
          title="Product (MVP Snapshot)"
          subtitle="Live platform • Real users • Real returns"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Q4 2025 web MVP delivers fractional purchases, escrow-backed
                transactions, and PropChain custody wallets.
              </p>
              <p>
                1,200+ users and ₦80M transacted across pilot properties — Lekki
                Apartments (₦50M, 100% funded, 180 investors) and Abuja Retail
                Space (₦30M, 80% funded).
              </p>
              <p className="font-medium text-foreground">Pilot properties:</p>
              <ul className="space-y-2">
                <li>
                  • Lekki Apartments — 10–12% rental yield already distributed.
                </li>
                <li>
                  • Abuja Retail Space — onboarding investors with escrow
                  protection.
                </li>
              </ul>
              <p>
                SEC-aligned SPV/Trust structure, governance boards, and
                real-time dashboards keep investors informed.
              </p>
            </div>
            <Card className="border-dashed bg-muted/20">
              <CardContent className="space-y-3 p-6 text-sm">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <UsersThreeIcon
                    size={22}
                    weight="fill"
                    className="text-primary"
                  />
                  1,200+ users, 25% active investors
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <CoinsIcon size={22} weight="fill" className="text-primary" />
                  ₦80M raised across pilot properties
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <ChartBarIcon
                    size={22}
                    weight="fill"
                    className="text-primary"
                  />
                  30% repeat investments — strong product-market fit
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          icon={ShieldCheckIcon}
          title="Technology & Security"
          subtitle="Compliance-first stack built on Hedera"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <ShieldStarIcon
                    size={20}
                    weight="fill"
                    className="text-primary"
                  />
                  Bank-grade safeguards
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <LockSimpleIcon
                      size={16}
                      weight="bold"
                      className="mt-0.5 text-primary"
                    />
                    <span>
                      NDIC-insured escrow accounts and licensed trustees protect
                      capital until each project closes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TargetIcon
                      size={16}
                      weight="bold"
                      className="mt-0.5 text-primary"
                    />
                    <span>
                      Smart contracts automate rent payouts, compliance, and
                      investor reporting end-to-end.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <GlobeIcon
                      size={16}
                      weight="bold"
                      className="mt-0.5 text-primary"
                    />
                    <span>
                      Mirror-node audit trails provide regulators and partners
                      with real-time transparency.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <UsersIcon size={20} weight="bold" className="text-primary" />
                  Trusted experience
                </div>
                <ul className="space-y-3">
                  <li>
                    • Instant digital onboarding with PropChain custody and
                    role-based permissions.
                  </li>
                  <li>
                    • Continuous monitoring, anomaly detection, and SOC-aligned
                    controls mitigate fraud.
                  </li>
                  <li>
                    • Regular audits by ChainSecure Inc. alongside legal reviews
                    ensure institutional readiness.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          icon={ChatsCircleIcon}
          title="Community Governance Layer"
          subtitle="From investing to belonging"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Every funded property graduates into a PropChain Circle — a
                dedicated investor community.
              </p>
              <ul className="space-y-2">
                <li>
                  • Automatic access to group chat/forums for property-specific
                  collaboration.
                </li>
                <li>
                  • Quarterly financials and proposals streamed via Hedera
                  Consensus Service.
                </li>
                <li>
                  • Members vote on maintenance, upgrades, or exit events with
                  tamper-proof audit trails.
                </li>
                <li>
                  • Grow networks with fellow co-owners and shape long-term
                  value together.
                </li>
              </ul>
              <p className="italic text-primary">
                “Imagine being part of the landlord community for your building
                — not just an investor.”
              </p>
            </div>
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <NetworkIcon
                    size={20}
                    weight="bold"
                    className="text-primary"
                  />
                  Powered by Hedera Consensus Service
                </div>
                <p>
                  Ensures transparent, immutable community decisions and
                  investor communications.
                </p>
                <ul className="space-y-2">
                  <li>• Time-stamped governance events</li>
                  <li>• Immutable decision logs</li>
                  <li>• Regulator-friendly auditability</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          icon={NetworkIcon}
          title="Why Hedera?"
          subtitle="Enterprise-grade DLT for trust, compliance, and scale"
        >
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
            <div className="grid grid-cols-3 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Use Case</span>
              <span>Hedera Service</span>
              <span>Purpose</span>
            </div>
            <div className="divide-y divide-border/60 text-sm">
              {[
                {
                  useCase: "Fractional Tokens",
                  service: "HTS (Token Service)",
                  purpose: "Mint & manage property-backed tokens",
                },
                {
                  useCase: "Investor Governance",
                  service: "HCS (Consensus Service)",
                  purpose: "Transparent voting & investor updates",
                },
                {
                  useCase: "Document Storage",
                  service: "HFS (File Service)",
                  purpose: "Immutable proof of title docs & valuations",
                },
                {
                  useCase: "Compliance & Audit",
                  service: "Mirror Nodes",
                  purpose: "Regulatory data feeds & transaction history",
                },
              ].map((row) => (
                <div
                  key={row.useCase}
                  className="grid grid-cols-3 items-start gap-2 px-4 py-3"
                >
                  <span className="font-medium">{row.useCase}</span>
                  <span className="text-muted-foreground">{row.service}</span>
                  <span className="text-muted-foreground">{row.purpose}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>• 3–5 sec finality, &lt;$0.001 average transaction cost</p>
            <p>• Carbon-negative, ABFT-secure network built for real assets</p>
            <p>• Mirror node transparency supports regulatory reporting</p>
            <p>
              • Ideal for Nigeria’s SEC framework and future cross-border
              expansion
            </p>
          </div>
        </Section>

        <Section
          icon={GlobeHemisphereWestIcon}
          title="Market Opportunity"
          subtitle="Nigeria’s $2+ Trillion Real Estate Market"
        >
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li>• $2.6T market (2025) growing at 6.8% CAGR.</li>
            <li>• 22M+ housing deficit = ₦5.5T annual demand.</li>
            <li>• $20.9B diaspora remittances — 30–40% flows into property.</li>
            <li>• PropTech funding at $9M+ (2022) and rising.</li>
            <li>
              • Capturing 0.05% of market unlocks $1.3B+ in transactional
              volume.
            </li>
            <li>
              • Target segments: middle-class professionals, diaspora investors,
              investment clubs/cooperatives.
            </li>
          </ul>
          <div className="mt-6 grid gap-8 text-sm text-muted-foreground lg:grid-cols-2 lg:items-center">
            <div className="flex items-center justify-center py-4">
              <div className="relative aspect-square w-full max-w-md">
                {/* TAM - Outer circle (100% of container) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-primary/50 bg-primary/5 backdrop-blur-sm">
                  <span className="text-base font-bold uppercase tracking-wider text-primary md:text-lg">
                    TAM
                  </span>
                  <span className="mt-1 text-2xl font-bold text-primary md:text-3xl lg:text-4xl">
                    $2.6T
                  </span>
                </div>
                {/* SAM - Middle circle (75% of container) */}
                <div className="absolute left-1/2 top-1/2 flex h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-emerald-600 bg-emerald-100/90 backdrop-blur-sm shadow-lg">
                  <span className="text-sm font-bold uppercase tracking-wider text-emerald-800 md:text-base">
                    SAM
                  </span>
                  <span className="mt-1 text-xl font-bold text-emerald-800 md:text-2xl lg:text-3xl">
                    $12.5B
                  </span>
                </div>
                {/* SOM - Inner circle (50% of container) */}
                <div className="absolute left-1/2 top-1/2 z-10 flex h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-amber-600 bg-amber-100 shadow-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 md:text-sm">
                    SOM
                  </span>
                  <span className="mt-1 text-lg font-bold text-amber-900 md:text-xl lg:text-2xl">
                    $1.3B
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3 lg:max-w-md">
              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <p className="font-semibold text-foreground">TAM</p>
                <p className="mt-1 text-sm">
                  Entire Nigerian real estate value ($2.6T).
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <p className="font-semibold text-foreground">SAM</p>
                <p className="mt-1 text-sm">
                  Urban fractional investment opportunity across Lagos/Abuja/PH +
                  diaspora inflows ($12.5B).
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <p className="font-semibold text-foreground">SOM</p>
                <p className="mt-1 text-sm">
                  Initial focus capturing 0.05% via 100 communities and diaspora
                  channels ($1.3B).
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          icon={BriefcaseIcon}
          title="Business Model"
          subtitle="Simple, Scalable, and Profitable"
        >
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
            <div className="grid grid-cols-[2fr,3fr,1fr] bg-muted px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Revenue Stream</span>
              <span>Description</span>
              <span className="text-right">% Fee</span>
            </div>
            <div className="divide-y divide-border/60 text-sm">
              {businessModel.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[2fr,3fr,1fr] items-center px-4 py-3"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.description}
                  </span>
                  <span className="text-right text-foreground">{item.fee}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <p className="font-semibold text-foreground">
                Unit Economics (Pilot Data)
              </p>
              <ul className="mt-3 space-y-2">
                <li>• Average investment ticket: ₦270k</li>
                <li>• Platform take rate: 2.5%</li>
                <li>• Revenue per user (LTV): ₦11,250 (~$15)</li>
                <li>• CAC: ₦3,000 (~$4) → LTV:CAC = 4:1</li>
                <li>• Payback period: less than 3 months</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <p>
                Asset-light, high-margin model tied directly to assets under
                management. Monetisation happens at fundraising, through ongoing
                management, and at liquidity events.
              </p>
            </div>
          </div>
        </Section>

        <Section
          icon={RocketLaunchIcon}
          title="Go-to-Market Strategy"
          subtitle="Phase-by-phase rollout from education to expansion"
        >
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">
                Phase 1 – Awareness & Education (Q1 2026)
              </p>
              <ul className="mt-2 space-y-1">
                <li>
                  • Free masterclasses, webinars, and influencer collaborations
                </li>
                <li>
                  • Referral program with bonus tokens to ignite word-of-mouth
                </li>
                <li>
                  • Partnerships with trusted developers for flagship listings
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Phase 2 – Distribution (Q2–Q4 2026)
              </p>
              <ul className="mt-2 space-y-1">
                <li>• Integrations with fintech apps and digital banks</li>
                <li>
                  • Employer investment programs (salary deductions → property
                  tokens)
                </li>
                <li>
                  • Community investment clubs and cooperatives onboarding
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Phase 3 – Expansion (2027–2028)
              </p>
              <ul className="mt-2 space-y-1">
                <li>• Diaspora channels in the UK, US, and Canada</li>
                <li>
                  • Institutional participation & secondary market liquidity
                </li>
                <li>• Target: 100 communities → 1 million co-owners</li>
              </ul>
            </div>
            <p className="font-medium text-foreground">
              Goal: 10,000+ users and ₦1B+ total investments in the first full
              year post-launch.
            </p>
          </div>
        </Section>

        <Section
          icon={ScalesIcon}
          title="Competitive Advantage"
          subtitle="Why PropChain wins"
        >
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 text-sm">
            <div className="grid grid-cols-3 bg-muted px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Factor</span>
              <span>Others</span>
              <span className="text-right">PropChain</span>
            </div>
            <div className="divide-y divide-border/60">
              {[
                {
                  factor: "Ownership Transparency",
                  others: "Opaque",
                  propchain: "Blockchain verified",
                },
                {
                  factor: "Liquidity",
                  others: "Locked-up",
                  propchain: "Secondary trading",
                },
                {
                  factor: "Minimum Investment",
                  others: "₦1M+",
                  propchain: "From ₦50k",
                },
                {
                  factor: "Regulatory Compliance",
                  others: "Often uncertain",
                  propchain: "SEC-aligned & licensed",
                },
                {
                  factor: "Investor Governance",
                  others: "Not offered",
                  propchain: "On-chain voting",
                },
                {
                  factor: "Community Engagement",
                  others: "Transaction-only",
                  propchain: "PropChain Circles",
                },
                {
                  factor: "User Education",
                  others: "Limited",
                  propchain: "Investor academy & tools",
                },
              ].map((item) => (
                <div
                  key={item.factor}
                  className="grid grid-cols-3 items-center px-4 py-3"
                >
                  <span className="font-medium">{item.factor}</span>
                  <span className="text-muted-foreground">{item.others}</span>
                  <span className="text-right text-primary font-medium">
                    {item.propchain}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          icon={GavelIcon}
          title="Regulatory Alignment"
          subtitle="Compliance as a moat"
        >
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li>
              • Structured under SEC’s 2021 crowdfunding rules with SPV-backed
              estates.
            </li>
            <li>
              • Investor funds held in NDIC-insured escrow accounts with
              licensed trustees.
            </li>
            <li>
              • Active engagement with SEC Nigeria for digital asset sandbox
              participation.
            </li>
            <li>
              • NDPR-aligned data handling and Finance Act-ready digital asset
              taxation.
            </li>
          </ul>
        </Section>

        <Section
          icon={ChartLineIcon}
          title="Traction"
          subtitle="Validated MVP traction"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 1,200+ users with 25% conversion to investors.</li>
              <li>
                • ₦80M transacted across pilot projects; ₦1.2M in early fees.
              </li>
              <li>• 30% repeat investments indicate stickiness.</li>
              <li>• ₦200M pipeline via ABC Developers partnership.</li>
              <li>
                • Selected for Lagos PropTech Incubator 2025 ($20K grant).
              </li>
              <li>• Average rental yield to investors: 10–12%.</li>
            </ul>
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <FlagBannerIcon
                    size={20}
                    weight="fill"
                    className="text-primary"
                  />
                  MVP launched with real tenants and payout history
                </div>
                <p>
                  Users manage holdings via dashboards, receive rent
                  distributions, and access audited documents.
                </p>
                <p className="text-xs italic text-primary">
                  “I never thought ₦50k could make me a landlord. PropChain made
                  it possible.” – Olamide, 27, Lagos
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={tractionChartData}
                      margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        label={{
                          value: "Users",
                          angle: -90,
                          position: "insideLeft",
                          offset: -4,
                          style: { fontSize: 11, fill: "#6b7280" },
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₦${value}M`}
                        label={{
                          value: "Investments (₦M)",
                          angle: 90,
                          position: "insideRight",
                          offset: -4,
                          style: { fontSize: 11, fill: "#6b7280" },
                        }}
                      />
                      <RechartsTooltip formatter={tractionTooltipFormatter} />
                      <Legend
                        verticalAlign="top"
                        height={28}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="investments"
                        name="Investments"
                        fill="#22c55e40"
                        stroke="#22c55e"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="users"
                        name="Users"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, stroke: "#f4f4f5" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          icon={MapTrifoldIcon}
          title="Roadmap"
          subtitle="Execution plan 2026 – 2028"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {roadmap.map((stage) => (
              <Card key={stage.year} className="border-border/50 bg-card/40">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <ArrowUpRightIcon
                      size={20}
                      weight="bold"
                      className="text-primary"
                    />
                    {stage.year}
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {stage.milestones.map((milestone) => (
                      <li key={milestone}>• {milestone}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          icon={PresentationChartIcon}
          title="Financial Projections"
          subtitle="Break-even by 2027"
        >
          <div className="space-y-8">
            {/* Chart Section */}
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="p-6">
                <h3 className="mb-4 text-base font-semibold text-foreground">
                  5-Year Financial Overview
                </h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={financialChartData}
                      margin={{ top: 20, right: 50, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        yAxisId="investments"
                        orientation="left"
                        tick={{ fontSize: 12, fill: "#7c3aed" }}
                        axisLine={{ stroke: "#7c3aed", strokeWidth: 2 }}
                        tickLine={{ stroke: "#7c3aed" }}
                        label={{
                          value: "Investments (USD Millions)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 10,
                          style: {
                            fontSize: 11,
                            fill: "#7c3aed",
                            fontWeight: 600,
                          },
                        }}
                      />
                      <YAxis
                        yAxisId="revenue-ebitda"
                        orientation="right"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={{ stroke: "#e5e7eb" }}
                        label={{
                          value: "Revenue & EBITDA (USD Millions)",
                          angle: 90,
                          position: "insideRight",
                          offset: 10,
                          style: {
                            fontSize: 11,
                            fill: "#6b7280",
                            fontWeight: 600,
                          },
                        }}
                      />
                      <RechartsTooltip
                        formatter={financialTooltipFormatter}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
                      />
                      <Bar
                        yAxisId="investments"
                        dataKey="investments"
                        name="Investments"
                        fill="#7c3aed"
                        radius={[6, 6, 0, 0]}
                        opacity={0.8}
                      />
                      <Line
                        yAxisId="revenue-ebitda"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#22c55e", strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        yAxisId="revenue-ebitda"
                        dataKey="ebitda"
                        name="EBITDA"
                        stroke="#f97316"
                        strokeDasharray="5 5"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#f97316", strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="p-6">
                <h3 className="mb-4 text-base font-semibold text-foreground">
                  5-Year Projections Table
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Year
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Users
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Investments
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Revenue
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          EBITDA
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {financials.map((item, index) => (
                        <tr
                          key={item.year}
                          className={`border-b border-border/60 transition-colors hover:bg-muted/30 ${
                            index % 2 === 0 ? "bg-background/50" : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {item.year}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            {item.users}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                            {item.investments}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground">
                            {item.revenue}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                            {item.ebitda}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Investments, revenue, and EBITDA expressed in USD (millions) for
            comparability. Digital model tracks &gt;70% gross margins by 2027.
          </p>
        </Section>

        <Section
          icon={UsersThreeIcon}
          title="Team"
          subtitle="Local insight, technical depth, proven execution"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {team.map((member) => (
              <Card key={member.name} className="border-border/50 bg-card/40">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <IdentificationBadgeIcon
                      size={20}
                      weight="bold"
                      className="text-primary"
                    />
                    {member.name}
                  </div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                  {member.socials ? (
                    <div className="flex items-center gap-3 pt-1">
                      {member.socials.map(
                        ({ icon: SocialIcon, href, label }, index) => (
                          <a
                            key={`${member.name}-social-${index}`}
                            href={href}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label={`${member.name} on ${label}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition hover:border-primary hover:text-primary"
                          >
                            <SocialIcon size={16} weight="fill" />
                          </a>
                        )
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Advisors</p>
            <ul className="mt-2 space-y-1">
              {advisors.map((advisor) => (
                <li key={advisor}>• {advisor}</li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          icon={CoinsIcon}
          title="Funding Ask"
          subtitle="Raising $1.5M seed round"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2 text-sm text-muted-foreground lg:col-span-2">
              <p>Use of Funds:</p>
              <ul className="space-y-1">
                <li>• 40% Product Development (mobile, exchange, security)</li>
                <li>• 25% Marketing & User Acquisition</li>
                <li>• 20% Operations & Compliance (SEC licensing)</li>
                <li>• 15% Reserve & Runway</li>
              </ul>
              <p>Terms:</p>
              <ul className="space-y-1">
                <li>• $6M pre-money valuation</li>
                <li>• 20% equity offered (SAFE/Convertible)</li>
                <li>
                  • 18-month runway to reach regulatory licensing, 10x user
                  growth, and ₦1B AUM.
                </li>
              </ul>
            </div>
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="h-64 p-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={useOfFunds}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {useOfFunds.map((entry, index) => (
                        <Cell key={entry.name} fill={fundingColors[index]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Allocation"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          icon={SunHorizonIcon}
          title="Vision & Close"
          subtitle="Owning the future of African real estate"
        >
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="text-lg font-medium text-foreground">
              “We’re not just building a platform — we’re building a
              people-powered property revolution.”
            </p>
            <p>
              PropChain’s vision is to make real estate ownership as accessible
              as savings. By turning physical assets into digital communities,
              we empower millions to build wealth, transparency, and connection
              — one property token at a time.
            </p>
            <Card className="border-dashed bg-muted/20">
              <CardContent className="space-y-3 p-5 text-sm">
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                  <FileTextIcon
                    size={18}
                    weight="bold"
                    className="text-primary"
                  />
                  <span>Contact: founders@propchain.ng</span>
                  <span>•</span>
                  <span>Website: www.propchain.ng</span>
                  <span>•</span>
                  <span>Ikoyi Crescent, Lagos, Nigeria</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </main>
    </div>
  );
};

export default PitchDeck;

type IconComponent = ComponentType<ComponentProps<typeof HouseLineIcon>>;

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  socials?: { icon: IconComponent; href: string; label: string }[];
};

type SectionProps = {
  icon: IconComponent;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const Section = ({ icon: Icon, title, subtitle, children }: SectionProps) => (
  <section className="space-y-6 rounded-2xl border border-border/60 bg-background/80 p-6 md:p-7 shadow-sm">
    <div className="flex flex-wrap items-start gap-4">
      <div className="rounded-full bg-primary/10 p-3 text-primary flex-shrink-0">
        <Icon size={22} weight="bold" />
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
    <div className="pt-2">{children}</div>
  </section>
);

type FeatureCardProps = {
  icon: IconComponent;
  title: string;
  description: string;
};

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Card className="h-full border-border/50 bg-card/40">
    <CardContent className="flex h-full flex-col gap-3 p-5">
      <Icon size={22} weight="fill" className="text-primary" />
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

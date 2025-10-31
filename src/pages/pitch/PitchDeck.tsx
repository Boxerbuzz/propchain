import {
  ArrowUpRight as ArrowUpRightIcon,
  ChartBar as ChartBarIcon,
  Briefcase as BriefcaseIcon,
  ChartLine as ChartLineIcon,
  CheckCircle as CheckCircleIcon,
  Coins as CoinsIcon,
  DeviceMobile as DeviceMobileIcon,
  FileText as FileTextIcon,
  FlagBanner as FlagBannerIcon,
  Gavel as GavelIcon,
  GlobeHemisphereWest as GlobeHemisphereWestIcon,
  HouseLine as HouseLineIcon,
  IdentificationBadge as IdentificationBadgeIcon,
  Lightning as LightningIcon,
  LightbulbFilament as LightbulbFilamentIcon,
  LockSimple as LockSimpleIcon,
  MapTrifold as MapTrifoldIcon,
  Megaphone as MegaphoneIcon,
  PresentationChart as PresentationChartIcon,
  RocketLaunch as RocketLaunchIcon,
  Scales as ScalesIcon,
  ShieldCheck as ShieldCheckIcon,
  SunHorizon as SunHorizonIcon,
  TrendUp as TrendUpIcon,
  UsersThree as UsersThreeIcon,
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
      description: "On every property investment",
      fee: "1–3%",
    },
    {
      label: "Management Fees",
      description: "Annual fee on property value or rent",
      fee: "0.5–1%",
    },
    {
      label: "Origination Fees",
      description: "Charged to property developers",
      fee: "2%",
    },
    {
      label: "Secondary Trades",
      description: "Peer-to-peer token trading",
      fee: "1%",
    },
    {
      label: "Premium Services",
      description: "Analytics, white-label licensing",
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
      ebitda: "$50K",
    },
    {
      year: "2028",
      users: "120,000",
      investments: "$50M",
      revenue: "$1.3M",
      ebitda: "$400K",
    },
    {
      year: "2029",
      users: "250,000",
      investments: "$120M",
      revenue: "$3M",
      ebitda: "$1.5M",
    },
  ];

  const team = [
    {
      name: "Adebola Ogunleye",
      role: "CEO",
      bio: "Real estate finance veteran ($50M+ deals, ex-Pension Fund Manager).",
    },
    {
      name: "Chinedu Okafor",
      role: "CTO",
      bio: "Blockchain engineer (ex-Fintech), 8 years building smart contract systems.",
    },
    {
      name: "Fatima Bello",
      role: "COO & Legal",
      bio: "Corporate lawyer, former Aluko & Oyebode, SEC regulation expert.",
    },
    {
      name: "Temi Adeoye",
      role: "CMO",
      bio: "Growth marketer (ex-Digital Bank), scaled users 100x via viral campaigns.",
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
        "SEC licensing",
        "Launch iOS/Android apps",
        "₦1B cumulative investments",
      ],
    },
    {
      year: "2027",
      milestones: [
        "Launch secondary marketplace",
        "₦5B+ invested; profitability milestone",
      ],
    },
    {
      year: "2028",
      milestones: [
        "Cross-border investments (diaspora)",
        "Pan-African expansion – Ghana, Kenya",
        "250,000+ users and $3M+ annual revenue",
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
    const revenueValue = parseFloat(
      item.revenue.replace(/[$MK]/g, ""),
    ) / (item.revenue.includes("K") ? 1000 : 1);
    const ebitdaValue = parseFloat(
      item.ebitda.replace(/[$MK-]/g, ""),
    ) / (item.ebitda.includes("K") ? 1000 : 1);
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
    props: any,
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
    name: string,
  ): [string, string] => {
    if (name === "Investments") {
      return [`₦${value.toLocaleString()}M`, name];
    }
    return [`${value.toLocaleString()}`, name];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
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
                Fractional real estate for Nigerians and the diaspora — “Own a
                piece of property, one token at a time.”
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <HouseLineIcon
                  size={18}
                  weight="fill"
                  className="text-primary"
                />
                <span>
                  Democratizing access to property investment with
                  blockchain-backed digital tokens.
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

      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
        <Section
          icon={LightbulbFilamentIcon}
          title="The Problem"
          subtitle="High Barriers to Real Estate Ownership in Nigeria"
        >
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                Average Lagos/Abuja home costs ₦50M+ — out of reach for 90% of
                earners.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                Mortgage crisis: &lt;1% of Nigerians have mortgages; interest
                rates exceed 18%.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                22M+ housing deficit with costs rising annually; informal deals
                remain risky.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="text-destructive"
              />
              <span>
                Middle-class Nigerians are locked out of wealth-building assets;
                savings horizon &gt;20 years.
              </span>
            </li>
          </ul>
        </Section>

        <Section
          icon={TrendUpIcon}
          title="The Solution"
          subtitle="PropChain – Tokenized Fractional Ownership"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureCard
              icon={CoinsIcon}
              title="Invest From ₦50k"
              description="Buy fractions of vetted properties instead of full assets."
            />
            <FeatureCard
              icon={ShieldCheckIcon}
              title="Blockchain Trust"
              description="Smart contracts automate rent payouts, compliance, and ownership tracking."
            />
            <FeatureCard
              icon={LockSimpleIcon}
              title="Secure Escrow"
              description="Funds held until projects are fully subscribed; capital protected."
            />
            <FeatureCard
              icon={ChartLineIcon}
              title="Liquidity Built-In"
              description="Trade or exit positions on the PropChain marketplace."
            />
          </div>
        </Section>

        <Section
          icon={DeviceMobileIcon}
          title="Product (MVP)"
          subtitle="Live MVP — Real Users, Real Investments"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Web platform for browsing verified properties, viewing projected
                yields, and checking token prices.
              </p>
              <p>
                KYC and wallet onboarding completed in minutes with secure
                custody.
              </p>
              <p className="font-medium text-foreground">Pilot properties:</p>
              <ul className="space-y-2">
                <li>• Lekki 4-unit apartment – ₦50M funded (100% goal).</li>
                <li>• Abuja retail space – ₦30M funded (80% goal).</li>
              </ul>
              <p>
                Dashboard tracks portfolio performance, rental income, and token
                holdings in real time.
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
              • Capturing 0.01% of market unlocks $200M revenue opportunity.
            </li>
          </ul>
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
        </Section>

        <Section
          icon={ShieldCheckIcon}
          title="Technology & Security"
          subtitle="Compliance-first infrastructure"
        >
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              • Blockchain-backed tokens maintain transparent, immutable
              ownership records.
            </p>
            <p>
              • Smart contracts automate rent payouts, compliance, and investor
              reporting.
            </p>
            <p>
              • NDIC-insured escrow accounts with partner banks protect investor
              capital.
            </p>
            <p>• KYC/AML aligned with Nigeria’s NDPR and SEC requirements.</p>
            <p>
              • Regular audits by ChainSecure Inc. and oversight by licensed
              trustees.
            </p>
          </div>
        </Section>

        <Section
          icon={RocketLaunchIcon}
          title="Go-to-Market Strategy"
          subtitle="Focused growth from Lagos & Abuja outward"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Target Users: Middle-class professionals, diaspora Nigerians,
                investment clubs.
              </p>
              <p>
                Expansion: Lagos & Abuja → Port Harcourt, Enugu, diaspora hubs
                (UK, US, Canada).
              </p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>Acquisition Channels:</p>
              <ul className="space-y-1">
                <li>• Investor education (webinars, workshops).</li>
                <li>• Referral bonuses via token rewards.</li>
                <li>
                  • Developer & bank partnerships for listings and financing.
                </li>
                <li>• Influencer-led personal finance content.</li>
              </ul>
              <p className="font-medium text-foreground">
                Goal: 10,000+ users and ₦1B+ investments in first full year
                post-launch.
              </p>
            </div>
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
                  others: "Low",
                  propchain: "Blockchain verified",
                },
                {
                  factor: "Liquidity",
                  others: "Locked",
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
              • Operating under SEC’s 2021 crowdfunding rules with SPV-backed
              structures.
            </li>
            <li>• NDIC-insured escrow accounts protect investor deposits.</li>
            <li>
              • Active engagement with SEC Nigeria for digital asset sandbox
              participation.
            </li>
            <li>
              • Full compliance with Land Use Act, NDPR, and Tax regulations.
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
            </ul>
            <Card className="border border-border/60 bg-card/40">
              <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <FlagBannerIcon size={20} weight="fill" className="text-primary" />
                  MVP launched with real tenants and payout history
                </div>
                <p>
                  Users manage holdings via dashboards, receive rent distributions, and access audited documents.
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={tractionChartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        label={{ value: "Users", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#6b7280" } }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₦${value}M`}
                        label={{ value: "Investments (₦M)", angle: 90, position: "insideRight", offset: -4, style: { fontSize: 11, fill: "#6b7280" } }}
                      />
                      <RechartsTooltip formatter={tractionTooltipFormatter} />
                      <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} />
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
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="border border-border/60 bg-card/40 lg:col-span-3">
              <CardContent className="h-72 p-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={financialChartData} margin={{ top: 16, right: 24, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}`}
                      label={{ value: "USD (Millions)", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#6b7280" } }}
                    />
                    <RechartsTooltip formatter={financialTooltipFormatter} />
                    <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} />
                    <Bar dataKey="investments" name="Investments" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    <Line dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                    <Line dataKey="ebitda" name="EBITDA" stroke="#f97316" strokeDasharray="5 4" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 lg:col-span-2">
              <div className="grid grid-cols-5 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Year</span>
                <span>Users</span>
                <span>Investments</span>
                <span>Revenue</span>
                <span>EBITDA</span>
              </div>
              <div className="divide-y divide-border/60 text-sm">
                {financials.map((item) => (
                  <div key={item.year} className="grid grid-cols-5 items-center px-4 py-3">
                    <span className="font-medium">{item.year}</span>
                    <span className="text-muted-foreground">{item.users}</span>
                    <span>{item.investments}</span>
                    <span>{item.revenue}</span>
                    <span className="text-primary font-medium">{item.ebitda}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Investments, revenue, and EBITDA displayed in USD (millions) for comparability across years.
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
                <CardContent className="space-y-2 p-5">
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
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={10} />
                    <RechartsTooltip formatter={(value: number) => [`${value}%`, "Allocation"]} />
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
              “We’re not just selling tokens — we’re giving Nigerians the power
              to own their future.”
            </p>
            <p>
              PropChain’s vision is to make real estate ownership accessible to
              every Nigerian, turning ₦50k investors into property co-owners —
              one token at a time.
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

type SectionProps = {
  icon: IconComponent;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const Section = ({ icon: Icon, title, subtitle, children }: SectionProps) => (
  <section className="space-y-5 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm">
    <div className="flex flex-wrap items-start gap-3">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <Icon size={22} weight="bold" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
    <div>{children}</div>
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

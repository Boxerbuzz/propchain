// Hook for generating mock property event data
// Nigerian names and data
const NIGERIAN_FIRST_NAMES = [
  "Chukwu", "Adebayo", "Amina", "Ngozi", "Oluwaseun", "Fatima", "Emeka", "Blessing",
  "Ibrahim", "Chioma", "Yusuf", "Chiamaka", "Aisha", "Chinedu", "Kemi", "Tunde",
  "Zainab", "Obiora", "Nneka", "Musa", "Funmi", "Uche", "Halima", "Ikenna"
];

const NIGERIAN_LAST_NAMES = [
  "Okonkwo", "Adeyemi", "Bello", "Eze", "Mohammed", "Okafor", "Abubakar", "Nwosu",
  "Hassan", "Ojo", "Okeke", "Aliyu", "Chukwu", "Ibrahim", "Nnamdi", "Sani",
  "Obi", "Yusuf", "Uzoma", "Garba"
];

const COMPANIES = [
  "PropertiesNG Ltd", "Lagos Real Estate Co", "Abuja Homes", "Nigerian Property Trust",
  "Premium Estates", "Urban Properties", "Elite Real Estate", "Capital Homes",
  "Skyline Properties", "Heritage Real Estate"
];

const PHONE_PREFIXES = ["+234 803", "+234 806", "+234 813", "+234 901", "+234 705", "+234 810"];
const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "propertiesng.com", "hotmail.com"];

// Helper functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDigits(count: number): string {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function futureDate(minDays: number, maxDays: number): string {
  const days = randomRange(minDays, maxDays);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function generateName(): { first: string; last: string; full: string } {
  const first = randomChoice(NIGERIAN_FIRST_NAMES);
  const last = randomChoice(NIGERIAN_LAST_NAMES);
  return { first, last, full: `${first} ${last}` };
}

function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomChoice(EMAIL_DOMAINS)}`;
}

function generatePhone(): string {
  return `${randomChoice(PHONE_PREFIXES)} ${randomDigits(7)}`;
}

export function useMockDataPrefill() {
  const generateMockRental = () => {
    const tenant = generateName();
    const rentAmount = randomRange(150000, 800000);
    const securityDeposit = rentAmount * 2;
    
    return {
      rental_type: randomChoice(["long_term", "short_term", "commercial"]),
      tenant_name: tenant.full,
      tenant_email: generateEmail(tenant.first, tenant.last),
      tenant_phone: generatePhone(),
      tenant_id_number: `NIN${randomDigits(11)}`,
      monthly_rent_ngn: rentAmount,
      security_deposit_ngn: securityDeposit,
      agency_fee_ngn: Math.round(rentAmount * 0.1),
      legal_fee_ngn: Math.round(rentAmount * 0.05),
      start_date: futureDate(1, 30),
      end_date: futureDate(365, 730),
      lease_duration_months: randomChoice([12, 24, 36]),
      payment_method: randomChoice(["bank_transfer", "cash", "check"]),
      payment_status: "completed",
      amount_paid_ngn: rentAmount + securityDeposit,
      special_terms: randomChoice(["", "Includes water bill", "Pet-friendly", "Renewable annually"]),
      notes: randomChoice([
        "Tenant has excellent credit history",
        "Lease includes option to renew",
        "Background check completed successfully",
        "Employment verification confirmed",
        "Previous landlord provided positive reference"
      ]) || "",
    };
  };

  const generateMockPurchase = () => {
    const buyer = generateName();
    const purchasePrice = randomRange(5000000, 50000000);
    const downPayment = Math.round(purchasePrice * 0.3);
    
    return {
      transaction_type: randomChoice(["full_purchase", "partial_sellout", "token_buyback"]),
      buyer_name: buyer.full,
      buyer_email: generateEmail(buyer.first, buyer.last),
      buyer_phone: generatePhone(),
      buyer_id_number: `NIN${randomDigits(11)}`,
      seller_name: randomChoice(["PropChain Platform", "Previous Owner", "Estate Trust"]),
      purchase_price_ngn: purchasePrice,
      purchase_price_usd: Math.round(purchasePrice / 1500),
      tokens_involved: randomRange(100, 10000),
      percentage_sold: randomRange(5, 100),
      payment_method: randomChoice(["bank_transfer", "cash", "mortgage"]),
      payment_plan: randomChoice(["outright", "installment", "mortgage"]),
      down_payment_ngn: downPayment,
      remaining_balance_ngn: purchasePrice - downPayment,
      transaction_status: "completed",
      completion_date: futureDate(30, 90),
      notes: randomChoice([
        "Transaction completed smoothly",
        "All documentation verified",
        "Title search completed - clear title",
        "Property survey conducted",
        "Legal due diligence completed"
      ]) || "",
    };
  };

  const generateMockInspection = () => {
    const inspector = generateName();
    
    return {
      inspection_type: randomChoice(["initial", "periodic", "pre_rental", "pre_sale", "maintenance"]),
      inspector_name: inspector.full,
      inspector_license: `INSP-${randomDigits(8)}`,
      inspector_company: randomChoice(COMPANIES),
      structural_condition: randomChoice(["excellent", "good", "fair", "needs_repair"]),
      foundation_status: randomChoice(["excellent", "good", "minor_issues", "needs_repair"]),
      roof_status: randomChoice(["excellent", "good", "minor_leaks", "needs_replacement"]),
      walls_status: randomChoice(["excellent", "good", "minor_cracks", "needs_repair"]),
      electrical_status: randomChoice(["excellent", "good", "needs_upgrade", "fair"]),
      plumbing_status: randomChoice(["excellent", "good", "minor_leaks", "needs_repair"]),
      overall_rating: randomRange(6, 10),
      market_value_estimate: randomRange(8000000, 60000000),
      rental_value_estimate: randomRange(200000, 900000),
      estimated_repair_cost: randomRange(0, 500000),
      notes: randomChoice([
        "Property is well-maintained overall",
        "Minor cosmetic improvements recommended",
        "All major systems functioning properly",
        "Inspection completed within 2 hours",
        "Detailed report provided to owner"
      ]) || "",
    };
  };

  const generateMockMaintenance = () => {
    const contractor = generateName();
    const estimatedCost = randomRange(20000, 500000);
    
    return {
      maintenance_type: randomChoice(["routine", "emergency", "preventive", "corrective", "repair", "upgrade"]) as "routine" | "emergency" | "preventive" | "corrective" | "repair" | "upgrade",
      issue_category: randomChoice(["plumbing", "electrical", "structural", "hvac", "landscaping"]),
      issue_severity: randomChoice(["low", "medium", "high", "critical"]) as "low" | "medium" | "high" | "critical",
      issue_description: randomChoice([
        "Kitchen sink faucet is dripping",
        "Air conditioning not cooling efficiently",
        "Broken light fixture in bedroom",
        "Clogged bathroom drain",
        "Loose tiles in entryway"
      ]) || "",
      contractor_name: contractor.full,
      contractor_company: randomChoice(["Fix-It Services", "Lagos Repairs", "Maintenance Masters", "ProFix Nigeria"]),
      contractor_phone: generatePhone(),
      estimated_cost_ngn: estimatedCost.toString(),
      actual_cost_ngn: (estimatedCost * randomRange(90, 110) / 100).toString(),
      work_performed: randomChoice([
        "Replaced faucet cartridge and tested for leaks",
        "Recharged AC unit and cleaned filters",
        "Installed new light fixture and tested operation",
        "Cleared drain blockage using professional equipment",
        "Re-grouted and secured loose tiles"
      ]),
      maintenance_status: "completed" as "scheduled" | "in_progress" | "completed" | "cancelled",
      payment_status: "completed" as "pending" | "partial" | "completed",
      follow_up_required: randomChoice([true, false]),
      notes: randomChoice([
        "Work completed within estimated timeframe",
        "All materials are high quality",
        "Follow-up inspection recommended in 6 months",
        "Warranty provided for parts and labor",
        "Tenants were informed of work schedule"
      ]),
    };
  };

  return {
    generateMockRental,
    generateMockPurchase,
    generateMockInspection,
    generateMockMaintenance,
  };
}

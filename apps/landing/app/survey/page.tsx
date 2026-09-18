"use client";

import React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  Footer,
  Header,
  HeroSlideshow,
  Input,
  Label,
  SubsidiaryNav,
  SubsidiaryPageIntro,
  SubsidiaryRouteGrid,
  TrustRibbon,
  Select,
  Textarea,
  dajemCompanyProfiles,
  useDajem,
} from "@repo/ui";
import {
  ArrowLeftRight,
  Calculator,
  CheckCircle2,
  Clock,
  Compass,
  FileUp,
  Home,
  Info,
  Layers,
  Loader2,
  Map,
  MapPin,
  PackageCheck,
  Ruler,
  Sparkles,
  Truck,
  UploadCloud,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMeasurement(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 4,
  }).format(amount);
}

type CalculatorService =
  | "perimeter"
  | "parcellation"
  | "topography"
  | "control"
  | "detail"
  | "engineering"
  | "litigation"
  | "reestablishment"
  | "lifting"
  | "change-of-title";
type ClientType = "private" | "corporate";
type DetailDensity = "low" | "medium" | "high";
type TopographyTerrain = "open-savannah" | "deciduous" | "swamp";
type ReestablishmentMode =
  | "identification-plot"
  | "recover-beacon"
  | "uncover-beacon"
  | "detect-unfound-beacon"
  | "reestablish-destroyed-beacon";
type ChangeOfTitleState = "undeveloped" | "developed";
type AcquisitionSource = "community" | "estate-developer" | "dajem" | "other";
type DeliveryZone = "enugu" | "southeast" | "other";
type DeliveryRateSource = "dajem-estimate" | "dhl-live";
type UploadedDocumentAttachment = {
  documentName: string;
  fileName: string;
  fileSizeKb: number;
  file?: File;
  storagePath?: string;
};

interface SurveyDeliveryCheckout {
  added: boolean;
  recipientName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  zone: DeliveryZone;
  fee: number;
  serviceName: string;
  estimatedDelivery: string;
  rateSource: DeliveryRateSource;
}

const surveyWorkspaceStorageKey = "dajem-survey-workspace-v1";

const orbitalNavItems = [
  { href: "/survey", label: "Home", icon: Home },
  { href: "/survey/services", label: "Services", icon: Layers },
  { href: "/survey/estimate", label: "Estimate", icon: Calculator },
  { href: "/survey/inquiry", label: "Inquiry", icon: FileUp },
  { href: "/survey/tracker", label: "Tracker", icon: Clock },
];

const orbitalPageMeta = {
  services: {
    eyebrow: "Orbital service catalog",
    title: "Professional survey and geomatics services",
    description: "Review available survey, mapping, boundary, and engineering work.",
  },
  estimate: {
    eyebrow: "Guided cost estimator",
    title: "Build a clear survey budget",
    description: "Calculate posted charges, extras, contingency, and DHL delivery.",
  },
  inquiry: {
    eyebrow: "Inquiry and document desk",
    title: "Submit a formal survey request",
    description: "Send property details, your estimate, and supporting documents.",
  },
  tracker: {
    eyebrow: "Client project tracker",
    title: "Follow every submitted survey request",
    description: "Check status, documents, payment notes, and delivery progress.",
  },
} as const;

interface EstimateLineItem {
  label: string;
  amount: number;
}

interface SurveyEstimate {
  serviceType: CalculatorService;
  serviceLabel: string;
  amount: number | null;
  detail: string;
  lineItems: EstimateLineItem[];
  selections: string[];
  notes: string[];
}

const calculatorServiceOptions: { value: CalculatorService; label: string }[] = [
  { value: "perimeter", label: "Perimeter Surveys" },
  { value: "parcellation", label: "Estate Parcellation Surveys" },
  { value: "topography", label: "Topography Surveys (Contouring)" },
  { value: "control", label: "Control Surveys" },
  { value: "detail", label: "Detail Surveys" },
  { value: "engineering", label: "Engineering Surveys" },
  { value: "litigation", label: "Litigation (Dispute) Surveys" },
  { value: "reestablishment", label: "Re-establishment Surveys" },
  { value: "lifting", label: "Lifting (Extraction from Layout)" },
  { value: "change-of-title", label: "Change of Title" },
];

const inquiryServiceOptions = [
  { value: "property-search", label: "Property Search" },
  ...calculatorServiceOptions,
];

const areaUnitOptions = [
  { value: "sqm", label: "Square Metres (sqm)" },
  { value: "hectare", label: "Hectares (Ha)" },
  { value: "acre", label: "Acres" },
  { value: "plot", label: "Plots (600sqm)" },
  { value: "sqft", label: "Square Feet" },
  { value: "sqyd", label: "Square Yards" },
  { value: "sqkm", label: "Square Kilometres" },
  { value: "sqmi", label: "Square Miles" },
  { value: "rood", label: "Roods" },
];

const areaUnitFactorsToSqm: Record<string, number> = {
  sqm: 1,
  hectare: 10000,
  acre: 4046.8564224,
  plot: 600,
  sqft: 0.09290304,
  sqyd: 0.83612736,
  sqkm: 1000000,
  sqmi: 2589988.110336,
  rood: 1011.7141056,
};

const perimeterFeeTable = [
  { min: 0.1, max: 600, private: 250000, corporate: 400500, label: "0.100 - 600 sq.m" },
  { min: 601, max: 1000, private: 300000, corporate: 500500, label: "601 - 1000 sq.m" },
  { min: 1001, max: 2000, private: 390000, corporate: 557700, label: "1001 - 2000 sq.m" },
  { min: 2001, max: 3000, private: 440000, corporate: 629200, label: "2001 - 3000 sq.m" },
  { min: 3001, max: 4000, private: 480000, corporate: 686400, label: "3001 - 4000 sq.m" },
  { min: 4001, max: 5000, private: 510000, corporate: 729300, label: "4001 - 5000 sq.m" },
  { min: 5001, max: 9999, private: 712338, corporate: 1018643.34, label: "5001 - 9999 sq.m" },
  { min: 10000, max: 59990, private: 1250926, corporate: 1788824.18, label: "1Ha - 5.999Ha" },
  { min: 60000, max: 109990, private: 1527184, corporate: 2183873.12, label: "6Ha - 10.999Ha" },
  { min: 110000, max: 159990, private: 1754691, corporate: 2509208.13, label: "11Ha - 15.999Ha" },
  { min: 160000, max: 209990, private: 1940411, corporate: 2774787.73, label: "16Ha - 20.999Ha" },
  { min: 210000, max: 259990, private: 2091309, corporate: 2990571.87, label: "21Ha - 25.999Ha" },
  { min: 260000, max: 309990, private: 2237563, corporate: 3199715.09, label: "26Ha - 30.999Ha" },
  { min: 310000, max: 359990, private: 2354799, corporate: 3367362.57, label: "31Ha - 35.999Ha" },
  { min: 360000, max: 409990, private: 2466927, corporate: 3527705.61, label: "36Ha - 40.999Ha" },
  { min: 410000, max: 459990, private: 2560948, corporate: 3662155.64, label: "41Ha - 45.999Ha" },
  { min: 460000, max: 500000, private: 2642200, corporate: 3778346, label: "46Ha - 50Ha" },
];

const litigationFeeTable = [
  { min: 0.1, max: 1000, private: 500000, corporate: 650500, label: "0.10 - 1000 sq.m" },
  { min: 1001, max: 2000, private: 540000, corporate: 707700, label: "1001 - 2000 sq.m" },
  { min: 2001, max: 3000, private: 590000, corporate: 779200, label: "2001 - 3000 sq.m" },
  { min: 3001, max: 4000, private: 630000, corporate: 836400, label: "3001 - 4000 sq.m" },
  { min: 4001, max: 5000, private: 660000, corporate: 879300, label: "4001 - 5000 sq.m" },
  { min: 5001, max: 9999, private: 862338, corporate: 1168643.34, label: "5001 - 9999 sq.m" },
  { min: 10000, max: 59990, private: 1450926, corporate: 1988824.18, label: "1Ha - 5.999Ha" },
  { min: 60000, max: 109990, private: 1727184, corporate: 2383873.12, label: "6Ha - 10.999Ha" },
  { min: 110000, max: 159990, private: 1954691, corporate: 2709208.13, label: "11Ha - 15.999Ha" },
  { min: 160000, max: 209990, private: 2140411, corporate: 2974787.73, label: "16Ha - 20.999Ha" },
  { min: 210000, max: 259990, private: 2291309, corporate: 3190571.87, label: "21Ha - 25.999Ha" },
  { min: 260000, max: 309990, private: 2437563, corporate: 3399715.09, label: "26Ha - 30.999Ha" },
  { min: 310000, max: 359990, private: 2554799, corporate: 3567362.57, label: "31Ha - 35.999Ha" },
  { min: 360000, max: 409990, private: 2666927, corporate: 3727705.61, label: "36Ha - 40.999Ha" },
  { min: 410000, max: 459990, private: 2760948, corporate: 3862155.64, label: "41Ha - 45.999Ha" },
  { min: 460000, max: 500000, private: 2842200, corporate: 3978346.003, label: "46Ha - 50Ha" },
];

const parcellationFeeBands = [
  { max: 5, rate: 250000 },
  { max: 10, rate: 240000 },
  { max: 15, rate: 230000 },
  { max: 20, rate: 220000 },
  { max: 25, rate: 210000 },
  { max: 30, rate: 200000 },
  { max: 35, rate: 190000 },
  { max: 40, rate: 180000 },
  { max: 45, rate: 170000 },
  { max: 50, rate: 160000 },
  { max: 55, rate: 150000 },
  { max: 60, rate: 140000 },
  { max: 65, rate: 130000 },
  { max: 70, rate: 125000 },
  { max: 75, rate: 120000 },
  { max: 80, rate: 115000 },
  { max: 85, rate: 110000 },
  { max: 90, rate: 105000 },
  { max: 100, rate: 100000 },
];

const topographyFeeTable = [
  { min: 0.1, max: 1000, amount: 290188, label: "0.1 sq.m - 1000 sq.m" },
  { min: 1001, max: 10000, amount: 696450, label: "1001 sq.m - 1Ha" },
  { min: 10001, max: 50000, amount: 1857200, label: "1.1Ha - 5Ha" },
  { min: 50001, max: 100000, amount: 3308138, label: "5.1Ha - 10Ha" },
  { min: 100001, max: 150000, amount: 4759075, label: "10.1Ha - 15Ha" },
  { min: 150001, max: 200000, amount: 6210013, label: "15.1Ha - 20Ha" },
  { min: 200001, max: 250000, amount: 7660950, label: "20.10Ha - 25Ha" },
  { min: 250001, max: 300000, amount: 9111888, label: "25.10Ha - 30Ha" },
  { min: 300001, max: 350000, amount: 10562825, label: "30.10Ha - 35Ha" },
  { min: 350001, max: 400000, amount: 12013763, label: "35.10Ha - 40Ha" },
  { min: 400001, max: 450000, amount: 13464700, label: "40.10Ha - 45Ha" },
  { min: 450001, max: 500000, amount: 14915638, label: "45.10Ha - 50Ha" },
];

const detailLowDensityTable = [
  { max: 1000, amount: 32501 },
  { max: 2000, amount: 65002 },
  { max: 3000, amount: 97503 },
  { max: 4000, amount: 130004 },
  { max: 5000, amount: 162505 },
  { max: 6000, amount: 195006 },
  { max: 7000, amount: 227507 },
  { max: 8000, amount: 260008 },
  { max: 9000, amount: 292509 },
  { max: 10000, amount: 325010 },
];

const perimeterExtraItems: EstimateLineItem[] = [
  { label: "Transportation", amount: 30000 },
  { label: "Security (4 persons)", amount: 100000 },
  { label: "Casual labourers (3 persons)", amount: 30000 },
  { label: "Skilled labourer (1 person)", amount: 15000 },
  { label: "Beacons", amount: 5000 },
];

const documentSubmissionOptions = [
  "Land Purchase Receipt",
  "Allocation Letter",
  "Deed of Lease/Assignment/Conveyance/Gift",
  "Irrevocable Power Of Attorney",
  "Old Survey Plan",
  "Others",
];

const propertySearchLayouts = [
  "Capitol Hills Villa & Resort",
  "CLIC Estate",
  "Hephzibah & Beulah City Estate (Block A)",
  "Hephzibah & Beulah City Estate (Block B)",
  "Magical Tower County Homes",
  "Majestic City Estate",
  "Star Residence",
];

const initialSurveyDelivery: SurveyDeliveryCheckout = {
  added: false,
  recipientName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "Enugu",
  postalCode: "",
  zone: "enugu",
  fee: 0,
  serviceName: "DHL Express Document Delivery",
  estimatedDelivery: "",
  rateSource: "dajem-estimate",
};

function getCalculatorServiceLabel(serviceType: CalculatorService) {
  return calculatorServiceOptions.find((service) => service.value === serviceType)?.label ?? "Survey Service";
}

function getInquiryServiceLabel(serviceType: string) {
  return inquiryServiceOptions.find((service) => service.value === serviceType)?.label ?? "Survey Service";
}

function getClientTypeLabel(clientType: ClientType) {
  return clientType === "private" ? "Private/Individual" : "Corporate";
}

function getTerrainLabel(terrain: string) {
  if (terrain === "hilly") return "Hilly / Mountainous";
  if (terrain === "swampy") return "Swamp / Waterlogged";
  return "Flat / Table land";
}

function getReestablishmentModeLabel(mode: ReestablishmentMode) {
  switch (mode) {
    case "identification-plot":
      return "Identification of Plot";
    case "recover-beacon":
      return "Recovering a Beacon";
    case "uncover-beacon":
      return "Uncovering a Beacon";
    case "detect-unfound-beacon":
      return "Detecting / Identifying Lost or Unfound Beacon";
    default:
      return "Re-establishment of Lost / Destroyed Beacons";
  }
}

function getReestablishmentUnitLabel(mode: ReestablishmentMode) {
  return mode === "identification-plot" ? "plots" : "beacons";
}

function getChangeOfTitleStateLabel(state: ChangeOfTitleState) {
  return state === "developed" ? "Developed plot" : "Undeveloped plot";
}

function parsePositiveNumber(value: string) {
  const numberValue = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function toSquareMetres(value: string, unit: string) {
  const factor = areaUnitFactorsToSqm[unit] ?? 1;
  return parsePositiveNumber(value) * factor;
}

function fromSquareMetres(squareMetres: number, unit: string) {
  const factor = areaUnitFactorsToSqm[unit] ?? 1;
  return squareMetres / factor;
}

function findFeeRow<T extends { min?: number; max: number }>(rows: T[], squareMetres: number) {
  return rows.find((row) => squareMetres >= (row.min ?? 0) && squareMetres <= row.max);
}

function sumLineItems(items: EstimateLineItem[]) {
  return items.reduce((total, item) => total + item.amount, 0);
}

function formatAreaSelection(parcelSize: string, parcelUnit: string) {
  const value = parsePositiveNumber(parcelSize);
  if (!value) return "Not entered";
  const unitLabel = areaUnitOptions.find((option) => option.value === parcelUnit)?.label ?? parcelUnit;
  return `${formatMeasurement(value)} ${unitLabel}`;
}

function addDeliveryLineItem(items: EstimateLineItem[], delivery: SurveyDeliveryCheckout) {
  if (!delivery.added || delivery.fee <= 0) return;

  items.push({
    label: `DHL Express survey plan delivery (${delivery.city}, ${delivery.state})`,
    amount: delivery.fee,
  });
}

function calculatePerimeterBaseEstimate(squareMetres: number, clientType: ClientType) {
  const row = findFeeRow(perimeterFeeTable, squareMetres);
  if (row) {
    return {
      amount: Math.round(row[clientType]),
      detail: row.label,
    };
  }

  if (squareMetres > 500000) {
    const base = perimeterFeeTable[perimeterFeeTable.length - 1][clientType];
    const extraHectares = Math.ceil(squareMetres / 10000 - 50);
    const extraRate = clientType === "private" ? 50000 : 70000;
    return {
      amount: Math.round(base + extraHectares * extraRate),
      detail: `46Ha - 50Ha base plus ${extraHectares} additional hectare(s)`,
    };
  }

  return null;
}

function calculateParcellationBaseEstimate(plotCount: number) {
  const plots = Math.ceil(plotCount);
  const band = parcellationFeeBands.find((entry) => plots <= entry.max);

  if (band) {
    return {
      amount: plots * band.rate,
      detail: `${plots} plot(s) at ${formatCurrency(band.rate)} per plot`,
    };
  }

  const amount = 100 * 100000 + (plots - 100) * 50000;
  return {
    amount,
    detail: "100 plots at N100,000 per plot plus N50,000 for each additional plot",
  };
}

function calculateTopographyBaseEstimate(squareMetres: number, terrain: TopographyTerrain) {
  const terrainFactor = terrain === "deciduous" ? 1.5 : terrain === "swamp" ? 2 : 1;
  const row = findFeeRow(topographyFeeTable, squareMetres);
  const base = row
    ? row.amount
    : squareMetres > 500000
      ? topographyFeeTable[topographyFeeTable.length - 1].amount + Math.ceil(squareMetres / 10000 - 50) * 100000
      : 0;
  if (!base) return null;

  const terrainLabel = terrain === "open-savannah" ? "Open Savannah" : terrain === "deciduous" ? "Deciduous x1.5" : "Swamp Area x2";
  return {
    amount: Math.round(base * terrainFactor),
    detail: `${row?.label ?? "Above 50Ha"} ${terrainLabel}`,
  };
}

function calculateDetailBaseEstimate(squareMetres: number, density: DetailDensity) {
  const factor = density === "medium" ? 1.5 : density === "high" ? 2 : 1;
  const row = detailLowDensityTable.find((entry) => squareMetres <= entry.max);
  const lowDensityBase = row
    ? row.amount
    : detailLowDensityTable[detailLowDensityTable.length - 1].amount + Math.ceil((squareMetres - 10000) / 10000) * 100000;
  const densityLabel = density === "low" ? "Low Density" : density === "medium" ? "Medium Density x1.5" : "High Density x2";
  return {
    amount: Math.round(lowDensityBase * factor),
    detail: densityLabel,
  };
}

function calculateLitigationBaseEstimate(squareMetres: number, clientType: ClientType) {
  const row = findFeeRow(litigationFeeTable, squareMetres);
  const base = row
    ? row[clientType]
    : squareMetres > 500000
      ? litigationFeeTable[litigationFeeTable.length - 1][clientType] + Math.ceil(squareMetres / 10000 - 50) * 100000
      : 0;

  if (!base) return null;

  return {
    amount: Math.round(base),
    detail: row?.label ?? "Above 50Ha",
  };
}

function buildEmptyEstimate(serviceType: CalculatorService, detail: string, notes: string[] = []): SurveyEstimate {
  return {
    serviceType,
    serviceLabel: getCalculatorServiceLabel(serviceType),
    amount: null,
    detail,
    lineItems: [],
    selections: [`Service: ${getCalculatorServiceLabel(serviceType)}`],
    notes,
  };
}

function calculateSurveyEstimate(inputs: {
  serviceType: CalculatorService;
  clientType: ClientType;
  parcelSize: string;
  parcelUnit: string;
  plotCount: string;
  topographyTerrain: TopographyTerrain;
  detailDensity: DetailDensity;
  courtAppearance: string;
  terrain: string;
  delivery: SurveyDeliveryCheckout;
  reestablishmentMode: ReestablishmentMode;
  reestablishmentCount: string;
  changeOfTitleState: ChangeOfTitleState;
}) {
  const serviceLabel = getCalculatorServiceLabel(inputs.serviceType);
  const areaSelection = formatAreaSelection(inputs.parcelSize, inputs.parcelUnit);
  const selections = [
    `Service: ${serviceLabel}`,
    `Terrain profile: ${getTerrainLabel(inputs.terrain)}`,
  ];

  if (inputs.delivery.added) {
    selections.push(
      `DHL delivery service: ${inputs.delivery.serviceName}`,
      `Delivery recipient: ${inputs.delivery.recipientName}`,
      `Delivery address: ${inputs.delivery.address}, ${inputs.delivery.city}, ${inputs.delivery.state}${inputs.delivery.postalCode ? ` ${inputs.delivery.postalCode}` : ""}, Nigeria`,
      `Delivery contact: ${inputs.delivery.phone}${inputs.delivery.email ? ` | ${inputs.delivery.email}` : ""}`,
      `Delivery rate: ${formatCurrency(inputs.delivery.fee)} (${inputs.delivery.rateSource === "dhl-live" ? "Live DHL account rate" : "DAJEM estimated DHL rate"})`,
      `Estimated delivery: ${inputs.delivery.estimatedDelivery}`,
    );
  }

  const deliveryFulfillmentNote = "DHL delivery will be booked after the survey plan is approved, ready for dispatch, and delivery payment is confirmed.";
  const buildScopedEmptyEstimate = (detail: string, notes: string[] = []): SurveyEstimate => ({
    ...buildEmptyEstimate(inputs.serviceType, detail),
    selections,
    notes: inputs.delivery.added ? [...notes, deliveryFulfillmentNote] : notes,
  });

  const addAmountAndSelections = (items: EstimateLineItem[], extraSelections: string[], detail: string, notes: string[]) => ({
    serviceType: inputs.serviceType,
    serviceLabel,
    amount: sumLineItems(items),
    detail,
    lineItems: items,
    selections: [...selections, ...extraSelections],
    notes: inputs.delivery.added
      ? [...notes, deliveryFulfillmentNote]
      : notes,
  });

  if (inputs.serviceType === "parcellation") {
    const plots = parsePositiveNumber(inputs.plotCount);
    if (!plots) {
      return buildScopedEmptyEstimate("Enter number of plots to calculate the estimate.");
    }

    const base = calculateParcellationBaseEstimate(plots);
    const items: EstimateLineItem[] = [
      { label: `Parcellation survey base (${base.detail})`, amount: base.amount },
    ];
    addDeliveryLineItem(items, inputs.delivery);

    return addAmountAndSelections(
      items,
      [`Number of plots: ${Math.ceil(plots)}`],
      base.detail,
      [
        inputs.delivery.added ? "The selected DHL delivery fee is included in this total." : "DHL delivery has not been added.",
        "Registry or site-specific requirements can still adjust the final operational bill.",
      ],
    );
  }

  if (inputs.serviceType === "control" || inputs.serviceType === "engineering") {
    return buildScopedEmptyEstimate(
      "Formal assessment is required for this selected service.",
      [
        "Control and engineering surveys vary with scope, control points, design requirements, and field access.",
        inputs.delivery.added
          ? `Selected DHL delivery: ${formatCurrency(inputs.delivery.fee)} to ${inputs.delivery.city}, ${inputs.delivery.state}.`
          : "DHL delivery has not been added.",
      ],
    );
  }

  if (inputs.serviceType === "reestablishment") {
    const quantity = parsePositiveNumber(inputs.reestablishmentCount);
    if (!quantity) {
      return buildScopedEmptyEstimate(`Enter number of ${getReestablishmentUnitLabel(inputs.reestablishmentMode)} to calculate the estimate.`);
    }

    const count = Math.ceil(quantity);
    const baseRate = inputs.reestablishmentMode === "reestablish-destroyed-beacon" ? 70000 : 50000;
    const baseAmount = count * baseRate;
    const contingency = Math.round(baseAmount * 0.05);
    const items: EstimateLineItem[] = [
      {
        label: `${getReestablishmentModeLabel(inputs.reestablishmentMode)} (${count} ${getReestablishmentUnitLabel(inputs.reestablishmentMode)})`,
        amount: baseAmount,
      },
      {
        label: "Contingency (5% of survey cost)",
        amount: contingency,
      },
    ];
    addDeliveryLineItem(items, inputs.delivery);

    const notes = [
      "Contingency has been added automatically at 5% of the survey cost.",
      "Identification of plot does not include transportation, recovery or detection costs beyond the selected option.",
      "Final field conditions can still affect operational scheduling and access costs.",
    ];

    return addAmountAndSelections(
      items,
      [
        `Re-establishment option: ${getReestablishmentModeLabel(inputs.reestablishmentMode)}`,
        `Quantity: ${count} ${getReestablishmentUnitLabel(inputs.reestablishmentMode)}`,
      ],
      `${getReestablishmentModeLabel(inputs.reestablishmentMode)} with contingency added.`,
      notes,
    );
  }

  if (inputs.serviceType === "change-of-title") {
    const plots = parsePositiveNumber(inputs.plotCount);
    if (!plots) {
      return buildScopedEmptyEstimate("Enter number of plots to calculate the estimate.");
    }

    const count = Math.ceil(plots);
    const rate = inputs.changeOfTitleState === "developed" ? 455000 : 350000;
    const items: EstimateLineItem[] = [
      {
        label: `Site re-inspection for ${getChangeOfTitleStateLabel(inputs.changeOfTitleState).toLowerCase()} (${count} plot(s))`,
        amount: count * rate,
      },
    ];
    addDeliveryLineItem(items, inputs.delivery);

    return addAmountAndSelections(
      items,
      [
        `Site condition: ${getChangeOfTitleStateLabel(inputs.changeOfTitleState)}`,
        `Number of plots: ${count}`,
      ],
      `Site re-inspection at ${formatCurrency(rate)} per plot.`,
      [
        "Undeveloped plots are charged at N350,000 per plot.",
        "Developed plots are charged at N455,000 per plot for updating.",
      ],
    );
  }

  if (inputs.serviceType === "lifting") {
    const plots = parsePositiveNumber(inputs.plotCount);
    const squareMetres = toSquareMetres(inputs.parcelSize, inputs.parcelUnit);
    if (!plots) {
      return buildScopedEmptyEstimate("Enter number of plots to calculate the estimate.");
    }
    if (!squareMetres) {
      return buildScopedEmptyEstimate("Enter parcel size to calculate the estimate.");
    }

    const count = Math.ceil(plots);
    const items: EstimateLineItem[] = [];
    const notes = [
      "Lifting under 1,000 sq.m is charged at a minimum of N350,000 per plot.",
      "Parcels from 1,000 sq.m upward are priced as perimeter survey.",
    ];

    let detail = "";
    if (squareMetres < 1000) {
      items.push({
        label: `Lifting minimum for parcels below 1,000 sq.m (${count} plot(s))`,
        amount: count * 350000,
      });
      detail = "Minimum N350,000 per plot applied.";
    } else {
      const perimeterBase = calculatePerimeterBaseEstimate(Math.max(squareMetres, 1000), inputs.clientType);
      if (!perimeterBase) {
        return buildScopedEmptyEstimate("Enter a parcel size within the supported perimeter survey table.");
      }

      const perimeterExtrasTotal = sumLineItems(perimeterExtraItems);
      items.push({
        label: `Perimeter-based lifting base (${perimeterBase.detail}) x ${count} plot(s)`,
        amount: perimeterBase.amount * count,
      });
      items.push({
        label: `Perimeter survey field operations x ${count} plot(s)`,
        amount: perimeterExtrasTotal * count,
      });
      detail = `${perimeterBase.detail} perimeter pricing applied to lifting.`;
    }

    addDeliveryLineItem(items, inputs.delivery);

    return addAmountAndSelections(
      items,
      [
        `Client type: ${getClientTypeLabel(inputs.clientType)}`,
        `Parcel size: ${areaSelection}`,
        `Number of plots: ${count}`,
      ],
      detail,
      notes,
    );
  }

  const squareMetres = toSquareMetres(inputs.parcelSize, inputs.parcelUnit);
  if (!squareMetres) {
    return buildScopedEmptyEstimate("Enter parcel size to calculate the estimate.");
  }

  if (inputs.serviceType === "perimeter") {
    const base = calculatePerimeterBaseEstimate(squareMetres, inputs.clientType);
    if (!base) {
      return buildScopedEmptyEstimate("Enter a parcel size within the supported perimeter survey table.");
    }

    const items: EstimateLineItem[] = [
      { label: `Perimeter survey base (${base.detail})`, amount: base.amount },
      ...perimeterExtraItems,
    ];
    addDeliveryLineItem(items, inputs.delivery);

    return addAmountAndSelections(
      items,
      [
        `Client type: ${getClientTypeLabel(inputs.clientType)}`,
        `Parcel size: ${areaSelection}`,
      ],
      `${base.detail} plus perimeter field operations.`,
      [
        "Perimeter summary includes transportation, security, casual labourers, skilled labourer, and beacons.",
        "These posted perimeter extras have been added to the total automatically.",
      ],
    );
  }

  if (inputs.serviceType === "topography") {
    const base = calculateTopographyBaseEstimate(squareMetres, inputs.topographyTerrain);
    if (!base) {
      return buildScopedEmptyEstimate("Enter a parcel size within the supported topography survey table.");
    }

    const items: EstimateLineItem[] = [
      { label: `Topography survey base (${base.detail})`, amount: base.amount },
    ];
    addDeliveryLineItem(items, inputs.delivery);

    return addAmountAndSelections(
      items,
      [
        `Parcel size: ${areaSelection}`,
        `Topography area type: ${base.detail.split(" ").slice(-2).join(" ")}`,
      ],
      base.detail,
      [
        "Topography estimate already reflects the selected terrain multiplier.",
        "Field access, vegetation density, and control requirements can still shift the final bill.",
      ],
    );
  }

  if (inputs.serviceType === "detail") {
    const base = calculateDetailBaseEstimate(squareMetres, inputs.detailDensity);
    const items: EstimateLineItem[] = [
      { label: `Detail survey base (${base.detail})`, amount: base.amount },
    ];
    addDeliveryLineItem(items, inputs.delivery);

    return addAmountAndSelections(
      items,
      [
        `Parcel size: ${areaSelection}`,
        `Detail density: ${base.detail}`,
      ],
      base.detail,
      [
        "Detail survey estimate reflects the selected density multiplier.",
        "Site accessibility and registry-ready output requirements can still affect the final field quote.",
      ],
    );
  }

  if (inputs.serviceType === "litigation") {
    const base = calculateLitigationBaseEstimate(squareMetres, inputs.clientType);
    if (!base) {
      return buildScopedEmptyEstimate("Enter a parcel size within the supported litigation survey table.");
    }

    const planCompilationRate = inputs.clientType === "private" ? 0.35 : 0.4;
    const planCompilation = Math.round(base.amount * planCompilationRate);
    const courtFee = inputs.courtAppearance === "yes"
      ? inputs.clientType === "private" ? 150000 : 200000
      : 0;

    const items: EstimateLineItem[] = [
      { label: `Litigation survey base (${base.detail})`, amount: base.amount },
      {
        label: `Plan compilation (${inputs.clientType === "private" ? "35%" : "40%"} of survey cost)`,
        amount: planCompilation,
      },
    ];

    if (courtFee) {
      items.push({
        label: "Court appearance minimum",
        amount: courtFee,
      });
    }

    addDeliveryLineItem(items, inputs.delivery);

    return addAmountAndSelections(
      items,
      [
        `Client type: ${getClientTypeLabel(inputs.clientType)}`,
        `Parcel size: ${areaSelection}`,
        `Court appearance: ${inputs.courtAppearance === "yes" ? "Yes" : "No"}`,
      ],
      `${base.detail} with plan compilation added.`,
      [
        "Plan compilation for litigation has been added as 35% for private or 40% for corporate work.",
        courtFee
          ? "Court appearance minimum has been included in the total."
          : "Court appearance minimum was not added because it was not selected.",
      ],
    );
  }

  return buildScopedEmptyEstimate("Formal assessment is required for this selected service.");
}

function buildEstimateNarrative(estimate: SurveyEstimate) {
  const sections: string[] = [];

  sections.push(`Estimator service: ${estimate.serviceLabel}`);
  sections.push(`Estimator detail: ${estimate.detail}`);

  if (estimate.amount !== null) {
    sections.push(`Estimated total: ${formatCurrency(estimate.amount)}`);
  }

  if (estimate.selections.length > 0) {
    sections.push(`Selections: ${estimate.selections.join(" | ")}`);
  }

  if (estimate.lineItems.length > 0) {
    sections.push(`Transactions summary: ${estimate.lineItems.map((item) => `${item.label} - ${formatCurrency(item.amount)}`).join(" | ")}`);
  }

  if (estimate.notes.length > 0) {
    sections.push(`Side notes: ${estimate.notes.join(" | ")}`);
  }

  return sections.join("\n");
}

function isCalculatorService(value: string): value is CalculatorService {
  return calculatorServiceOptions.some((service) => service.value === value);
}

export default function SurveyPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pageView = pathname === "/survey/services"
    ? "services"
    : pathname === "/survey/estimate"
      ? "estimate"
      : pathname === "/survey/inquiry"
        ? "inquiry"
        : pathname === "/survey/tracker"
          ? "tracker"
          : "home";
  const activePageMeta = pageView === "home" ? null : orbitalPageMeta[pageView];
  const profile = dajemCompanyProfiles.survey;
  const { currentUser, openAuthModal, requireAuth, snapshot, submitSurvey } = useDajem();
  const [calculatorInputs, setCalculatorInputs] = React.useState({
    serviceType: "perimeter" as CalculatorService,
    clientType: "private" as ClientType,
    parcelSize: "600",
    parcelUnit: "sqm",
    plotCount: "1",
    topographyTerrain: "open-savannah" as TopographyTerrain,
    detailDensity: "low" as DetailDensity,
    courtAppearance: "no",
    terrain: "flat",
    reestablishmentMode: "identification-plot" as ReestablishmentMode,
    reestablishmentCount: "1",
    changeOfTitleState: "undeveloped" as ChangeOfTitleState,
  });
  const [unitConverter, setUnitConverter] = React.useState({
    fromUnit: "sqm",
    toUnit: "hectare",
    quantity: "1000",
  });
  const [quoteForm, setQuoteForm] = React.useState({
    location: "",
    serviceType: "perimeter",
    description: "",
    acquisitionSource: "dajem" as AcquisitionSource,
    acquisitionCompany: "",
    hasExistingSurveyPlan: "yes",
    planNumber: "",
    planYear: "",
    uploadedDocuments: [] as string[],
    attested: false,
    propertySearchLayout: "",
  });
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedDocumentAttachment[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [quoteSent, setQuoteSent] = React.useState(false);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);
  const [deliveryCheckout, setDeliveryCheckout] = React.useState<SurveyDeliveryCheckout>(initialSurveyDelivery);
  const [deliveryError, setDeliveryError] = React.useState<string | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = React.useState(false);
  const [deliveryEditor, setDeliveryEditor] = React.useState<string | null>(null);
  const [workspaceHydrated, setWorkspaceHydrated] = React.useState(false);

  const calculatedEstimate = calculateSurveyEstimate({ ...calculatorInputs, delivery: deliveryCheckout });
  const linkedInquiryEstimate = isCalculatorService(quoteForm.serviceType)
    ? calculateSurveyEstimate({ ...calculatorInputs, serviceType: quoteForm.serviceType, delivery: deliveryCheckout })
    : null;

  const serviceIcons = [Ruler, Compass, Map, Layers];
  const services = snapshot.surveyServices
    .filter((service) => service.status === "Approved")
    .map((service, index) => ({
      ...service,
      icon: serviceIcons[index % serviceIcons.length],
    }));

  const userSurveys = currentUser ? snapshot.surveys.filter((survey) => survey.userEmail === currentUser.email) : [];
  const billingType = quoteForm.serviceType === "change-of-title"
    ? "Change of Title"
    : quoteForm.hasExistingSurveyPlan === "no"
      ? "New Survey"
      : "Service Request";
  const convertedQuantity = fromSquareMetres(
    toSquareMetres(unitConverter.quantity, unitConverter.fromUnit),
    unitConverter.toUnit,
  );

  React.useEffect(() => {
    try {
      const savedWorkspace = window.sessionStorage.getItem(surveyWorkspaceStorageKey);
      if (savedWorkspace) {
        const parsed = JSON.parse(savedWorkspace) as {
          calculatorInputs?: typeof calculatorInputs;
          deliveryCheckout?: SurveyDeliveryCheckout;
          inquiryService?: string;
        };
        if (parsed.calculatorInputs) setCalculatorInputs(parsed.calculatorInputs);
        if (parsed.deliveryCheckout) setDeliveryCheckout(parsed.deliveryCheckout);
        if (parsed.inquiryService) {
          setQuoteForm((current) => ({ ...current, serviceType: parsed.inquiryService ?? current.serviceType }));
        }
      }
    } catch {
      window.sessionStorage.removeItem(surveyWorkspaceStorageKey);
    } finally {
      setWorkspaceHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (!workspaceHydrated) return;
    window.sessionStorage.setItem(surveyWorkspaceStorageKey, JSON.stringify({
      calculatorInputs,
      deliveryCheckout,
      inquiryService: quoteForm.serviceType,
    }));
  }, [calculatorInputs, deliveryCheckout, quoteForm.serviceType, workspaceHydrated]);

  React.useEffect(() => {
    if (!currentUser) return;

    setDeliveryCheckout((current) => ({
      ...current,
      recipientName: current.recipientName || currentUser.name,
      phone: current.phone || currentUser.phone,
      email: current.email || currentUser.email,
    }));
  }, [currentUser]);

  const setCalculatorValue = <K extends keyof typeof calculatorInputs>(key: K, value: (typeof calculatorInputs)[K]) => {
    setCalculatorInputs((current) => ({ ...current, [key]: value }));
  };

  const setDeliveryValue = <K extends keyof SurveyDeliveryCheckout>(key: K, value: SurveyDeliveryCheckout[K]) => {
    setDeliveryError(null);
    setDeliveryCheckout((current) => ({
      ...current,
      [key]: value,
      added: false,
      fee: 0,
      estimatedDelivery: "",
    }));
  };

  const calculateAndAddDelivery = async () => {
    const requiredFields = [
      deliveryCheckout.recipientName,
      deliveryCheckout.phone,
      deliveryCheckout.address,
      deliveryCheckout.city,
      deliveryCheckout.state,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      setDeliveryError("Enter the recipient name, phone number, street address, city, and state before calculating delivery.");
      return;
    }

    setDeliveryError(null);
    setIsCalculatingDelivery(true);

    try {
      const response = await fetch("/api/dhl/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: {
            city: deliveryCheckout.city,
            state: deliveryCheckout.state,
            postalCode: deliveryCheckout.postalCode,
            countryCode: "NG",
          },
          zone: deliveryCheckout.zone,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to calculate DHL delivery right now.");
      }

      setDeliveryCheckout((current) => ({
        ...current,
        added: true,
        fee: Number(payload.amount),
        serviceName: String(payload.serviceName ?? "DHL Express Document Delivery"),
        estimatedDelivery: String(payload.estimatedDelivery ?? "2-5 business days after dispatch"),
        rateSource: payload.source === "dhl-live" ? "dhl-live" : "dajem-estimate",
      }));
    } catch (error) {
      setDeliveryError(error instanceof Error ? error.message : "Unable to calculate DHL delivery right now.");
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  const removeDelivery = () => {
    setDeliveryError(null);
    setDeliveryCheckout((current) => ({
      ...current,
      added: false,
      fee: 0,
      estimatedDelivery: "",
      rateSource: "dajem-estimate",
    }));
    setDeliveryEditor(null);
  };

  const buildFilesFromList = (files: FileList | null, documentNames = quoteForm.uploadedDocuments) => {
    if (!files) return [];
    return Array.from(files).slice(0, documentNames.length).map((file, index) => ({
      documentName: documentNames[index] ?? `Document ${index + 1}`,
      fileName: file.name,
      fileSizeKb: Math.round(file.size / 1024),
      file,
    }));
  };

  const setDocumentAttachment = (documentName: string, file: File | undefined) => {
    setQuoteError(null);
    setUploadedFiles((current) => {
      const withoutCurrent = current.filter((attachment) => attachment.documentName !== documentName);
      if (!file) return withoutCurrent;

      return [
        ...withoutCurrent,
        {
          documentName,
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024),
          file,
        },
      ];
    });
  };

  const uploadSurveyAttachment = async (attachment: UploadedDocumentAttachment) => {
    if (!attachment.file) {
      return {
        documentName: attachment.documentName,
        fileName: attachment.fileName,
        fileSizeKb: attachment.fileSizeKb,
        storagePath: attachment.storagePath,
      };
    }

    const formData = new FormData();
    formData.append("documentName", attachment.documentName);
    formData.append("file", attachment.file);

    const response = await fetch("/api/storage/survey-documents", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error ?? `Unable to upload ${attachment.fileName}.`);
    }

    return {
      documentName: attachment.documentName,
      fileName: String(data?.attachment?.fileName ?? attachment.fileName),
      fileSizeKb: Number(data?.attachment?.fileSizeKb ?? attachment.fileSizeKb),
      storagePath: typeof data?.attachment?.storagePath === "string" ? data.attachment.storagePath : undefined,
    };
  };

  const toggleSubmittedDocument = (documentName: string, selected: boolean) => {
    setQuoteForm((current) => ({
      ...current,
      uploadedDocuments: selected
        ? [...current.uploadedDocuments, documentName]
        : current.uploadedDocuments.filter((item) => item !== documentName),
    }));

    if (!selected) {
      setUploadedFiles((current) => current.filter((attachment) => attachment.documentName !== documentName));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    setUploadedFiles(buildFilesFromList(event.dataTransfer.files));
  };

  const handleInquiryServiceChange = (value: string) => {
    setQuoteError(null);
    setQuoteForm((current) => ({
      ...current,
      serviceType: value,
      propertySearchLayout: value === "property-search" ? current.propertySearchLayout : "",
      hasExistingSurveyPlan: value === "change-of-title" ? "yes" : current.hasExistingSurveyPlan,
    }));

    if (isCalculatorService(value)) {
      setCalculatorInputs((current) => ({ ...current, serviceType: value }));
    }
  };

  const openInquiryFromEstimate = () => {
    const inquiryService = calculatorInputs.serviceType;
    handleInquiryServiceChange(inquiryService);
    window.sessionStorage.setItem(surveyWorkspaceStorageKey, JSON.stringify({
      calculatorInputs,
      deliveryCheckout,
      inquiryService,
    }));
    router.push("/survey/inquiry");
  };

  const renderDeliveryCheckout = (idPrefix: string) => {
    if (deliveryEditor !== idPrefix) {
      return (
        <div className="overflow-hidden rounded-2xl border border-amber-400/45 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm dark:border-amber-400/20 dark:from-amber-950/25 dark:to-slate-950/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-red-700 shadow-sm">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold tracking-tight text-foreground">{deliveryCheckout.added ? "DHL delivery is included" : "Deliver my survey plan with DHL"}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {deliveryCheckout.added
                    ? `${formatCurrency(deliveryCheckout.fee)} · ${deliveryCheckout.city}, ${deliveryCheckout.state} · ${deliveryCheckout.estimatedDelivery}`
                    : "Add secure document delivery to your estimate and Inquiry Desk request."}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={deliveryCheckout.added ? "outline" : "default"}
              className={deliveryCheckout.added ? "shrink-0 border-red-700 text-red-800 hover:bg-red-50 dark:text-red-200" : "shrink-0 bg-red-700 text-white hover:bg-red-800"}
              onClick={() => setDeliveryEditor(idPrefix)}
            >
              <PackageCheck className="h-4 w-4" />
              {deliveryCheckout.added ? "View Delivery" : "Add DHL Delivery"}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-amber-400/55 bg-card shadow-lg">
        <div className="border-b border-amber-400/35 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-50 p-4 text-slate-950 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-red-700 text-[11px] font-black italic tracking-tight text-amber-200 shadow-sm">DHL</span>
              <div>
                <p className="font-extrabold">Survey Plan Delivery Checkout</p>
                <p className="text-xs font-medium text-slate-700">Secure document envelope from DAJEM Orbital, Enugu</p>
              </div>
            </div>
            <button type="button" onClick={removeDelivery} className="rounded-lg bg-white/65 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white">
              Remove
            </button>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <div className="rounded-lg bg-primary px-2 py-2 text-primary-foreground">1. Address</div>
            <div className={deliveryCheckout.added ? "rounded-lg bg-primary px-2 py-2 text-primary-foreground" : "rounded-lg bg-muted px-2 py-2"}>2. Rate</div>
            <div className={deliveryCheckout.added ? "rounded-lg bg-emerald-700 px-2 py-2 text-white" : "rounded-lg bg-muted px-2 py-2"}>3. Added</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-delivery-name`}>Recipient Name</Label>
              <Input id={`${idPrefix}-delivery-name`} autoComplete="name" value={deliveryCheckout.recipientName} onChange={(event) => setDeliveryValue("recipientName", event.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-delivery-phone`}>Phone Number</Label>
              <Input id={`${idPrefix}-delivery-phone`} type="tel" autoComplete="tel" value={deliveryCheckout.phone} onChange={(event) => setDeliveryValue("phone", event.target.value)} placeholder="+234..." />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-delivery-email`}>Email Address <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id={`${idPrefix}-delivery-email`} type="email" autoComplete="email" value={deliveryCheckout.email} onChange={(event) => setDeliveryValue("email", event.target.value)} placeholder="recipient@example.com" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-delivery-address`}>Street Address</Label>
              <Input id={`${idPrefix}-delivery-address`} autoComplete="street-address" value={deliveryCheckout.address} onChange={(event) => setDeliveryValue("address", event.target.value)} placeholder="House number, street and landmark" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-delivery-city`}>City / Town</Label>
              <Input id={`${idPrefix}-delivery-city`} autoComplete="address-level2" value={deliveryCheckout.city} onChange={(event) => setDeliveryValue("city", event.target.value)} placeholder="Enugu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-delivery-state`}>State</Label>
              <Input id={`${idPrefix}-delivery-state`} autoComplete="address-level1" value={deliveryCheckout.state} onChange={(event) => setDeliveryValue("state", event.target.value)} placeholder="Enugu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-delivery-postal`}>Postal Code <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id={`${idPrefix}-delivery-postal`} inputMode="numeric" autoComplete="postal-code" value={deliveryCheckout.postalCode} onChange={(event) => setDeliveryValue("postalCode", event.target.value)} placeholder="400001" />
            </div>
            <Select
              label="Delivery Zone"
              value={deliveryCheckout.zone}
              onChange={(event) => setDeliveryValue("zone", event.target.value as DeliveryZone)}
              options={[
                { value: "enugu", label: "Within Enugu State" },
                { value: "southeast", label: "Abia, Imo, Anambra or Ebonyi" },
                { value: "other", label: "Other Nigerian States" },
              ]}
            />
          </div>

          <div className="grid gap-3 rounded-xl border bg-muted/25 p-4 text-xs sm:grid-cols-3">
            <div><p className="font-bold text-foreground">Document envelope</p><p className="mt-1 text-muted-foreground">Survey plan package</p></div>
            <div><p className="font-bold text-foreground">0.5 kg</p><p className="mt-1 text-muted-foreground">35 x 25 x 2 cm</p></div>
            <div><p className="font-bold text-foreground">From Enugu</p><p className="mt-1 text-muted-foreground">Domestic delivery</p></div>
          </div>

          {deliveryError && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{deliveryError}</p>}

          {deliveryCheckout.added && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/35">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-100">Delivery added to estimate</p>
                    <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">{deliveryCheckout.serviceName} · {deliveryCheckout.estimatedDelivery}</p>
                    <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">{deliveryCheckout.rateSource === "dhl-live" ? "Live DHL account rate" : "DAJEM estimated DHL rate"}</p>
                  </div>
                </div>
                <p className="text-xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(deliveryCheckout.fee)}</p>
              </div>
            </div>
          )}

          <Button type="button" className="w-full bg-red-700 text-white hover:bg-red-800" disabled={isCalculatingDelivery} onClick={calculateAndAddDelivery}>
            {isCalculatingDelivery ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {isCalculatingDelivery ? "Calculating DHL Rate..." : deliveryCheckout.added ? "Recalculate Delivery" : "Calculate & Add Delivery"}
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">The displayed rate is an estimate until DHL accepts the shipment. Dispatch is arranged when the completed survey plan and delivery payment are confirmed.</p>
        </div>
      </div>
    );
  };

  const renderSharedEstimatorFields = (serviceType: CalculatorService, idPrefix: string) => (
    <>
      {(serviceType === "perimeter" || serviceType === "litigation" || serviceType === "lifting") && (
        <Select
          label="Client Type"
          value={calculatorInputs.clientType}
          onChange={(event) => setCalculatorValue("clientType", event.target.value as ClientType)}
          options={[
            { value: "private", label: "Private/Individual" },
            { value: "corporate", label: "Corporate" },
          ]}
        />
      )}

      {serviceType === "topography" && (
        <Select
          label="Topography Area Type"
          value={calculatorInputs.topographyTerrain}
          onChange={(event) => setCalculatorValue("topographyTerrain", event.target.value as TopographyTerrain)}
          options={[
            { value: "open-savannah", label: "Open Savannah" },
            { value: "deciduous", label: "Deciduous" },
            { value: "swamp", label: "Swamp Area" },
          ]}
        />
      )}

      {serviceType === "detail" && (
        <Select
          label="Density"
          value={calculatorInputs.detailDensity}
          onChange={(event) => setCalculatorValue("detailDensity", event.target.value as DetailDensity)}
          options={[
            { value: "low", label: "Low Density" },
            { value: "medium", label: "Medium Density" },
            { value: "high", label: "High Density" },
          ]}
        />
      )}

      {serviceType === "litigation" && (
        <Select
          label="Court Appearance"
          value={calculatorInputs.courtAppearance}
          onChange={(event) => setCalculatorValue("courtAppearance", event.target.value)}
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
        />
      )}

      {serviceType === "reestablishment" && (
        <>
          <Select
            label="Re-establishment Option"
            value={calculatorInputs.reestablishmentMode}
            onChange={(event) => setCalculatorValue("reestablishmentMode", event.target.value as ReestablishmentMode)}
            options={[
              { value: "identification-plot", label: "Identification of Plot" },
              { value: "recover-beacon", label: "Recovering a Beacon" },
              { value: "uncover-beacon", label: "Uncovering a Beacon" },
              { value: "detect-unfound-beacon", label: "Detecting / Identifying Lost or Unfound Beacon" },
              { value: "reestablish-destroyed-beacon", label: "Re-establishment of Lost / Destroyed Beacons" },
            ]}
          />
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-reestablishment-count`}>
              {calculatorInputs.reestablishmentMode === "identification-plot" ? "Number of Plots" : "Number of Beacons"}
            </Label>
            <Input
              id={`${idPrefix}-reestablishment-count`}
              inputMode="numeric"
              min="1"
              type="number"
              value={calculatorInputs.reestablishmentCount}
              onChange={(event) => setCalculatorValue("reestablishmentCount", event.target.value)}
            />
          </div>
        </>
      )}

      {serviceType === "change-of-title" && (
        <>
          <Select
            label="Site Re-inspection Type"
            value={calculatorInputs.changeOfTitleState}
            onChange={(event) => setCalculatorValue("changeOfTitleState", event.target.value as ChangeOfTitleState)}
            options={[
              { value: "undeveloped", label: "Undeveloped Plot" },
              { value: "developed", label: "Developed Plot" },
            ]}
          />
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-change-title-plots`}>Number of Plots</Label>
            <Input
              id={`${idPrefix}-change-title-plots`}
              inputMode="numeric"
              min="1"
              type="number"
              value={calculatorInputs.plotCount}
              onChange={(event) => setCalculatorValue("plotCount", event.target.value)}
            />
          </div>
        </>
      )}

      {(serviceType === "parcellation" || serviceType === "lifting") && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-plot-count`}>Number of Plots</Label>
          <Input
            id={`${idPrefix}-plot-count`}
            inputMode="numeric"
            min="1"
            type="number"
            value={calculatorInputs.plotCount}
            onChange={(event) => setCalculatorValue("plotCount", event.target.value)}
          />
        </div>
      )}

      {["perimeter", "topography", "detail", "litigation", "lifting"].includes(serviceType) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_0.85fr]">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-parcel-size`}>Land Size</Label>
            <Input
              id={`${idPrefix}-parcel-size`}
              inputMode="decimal"
              placeholder="600"
              value={calculatorInputs.parcelSize}
              onChange={(event) => setCalculatorValue("parcelSize", event.target.value)}
            />
          </div>
          <Select
            label="Unit"
            value={calculatorInputs.parcelUnit}
            onChange={(event) => setCalculatorValue("parcelUnit", event.target.value)}
            options={areaUnitOptions}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Select
          label="Terrain Profile"
          value={calculatorInputs.terrain}
          onChange={(event) => setCalculatorValue("terrain", event.target.value)}
          options={[
            { value: "flat", label: "Flat / Table land" },
            { value: "hilly", label: "Hilly / Mountainous" },
            { value: "swampy", label: "Swamp / Waterlogged" },
          ]}
        />
      </div>

      {renderDeliveryCheckout(idPrefix)}
    </>
  );

  const handleQuoteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setQuoteError(null);

    if (!requireAuth("signup")) return;
    if (!quoteForm.attested) return;

    if (quoteForm.serviceType === "property-search" && !quoteForm.propertySearchLayout) {
      setQuoteError("Please select the LANDS/ESTATE/LAYOUT item for this property search request.");
      return;
    }

    const missingAttachments = quoteForm.uploadedDocuments.filter((documentName) => (
      !uploadedFiles.some((attachment) => attachment.documentName === documentName)
    ));

    if (missingAttachments.length > 0) {
      setQuoteError(`Attach the selected document before submitting: ${missingAttachments.join(", ")}.`);
      return;
    }

    let storedAttachments: Awaited<ReturnType<typeof uploadSurveyAttachment>>[];
    try {
      storedAttachments = await Promise.all(uploadedFiles.map(uploadSurveyAttachment));
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Unable to upload the selected documents.");
      return;
    }

    const estimateNarrative = linkedInquiryEstimate ? buildEstimateNarrative(linkedInquiryEstimate) : null;
    const propertySourceName = quoteForm.acquisitionCompany.trim();
    const narrativeBlocks = [
      quoteForm.description.trim(),
      `Requested service: ${getInquiryServiceLabel(quoteForm.serviceType)}`,
      quoteForm.propertySearchLayout ? `Property search selection: ${quoteForm.propertySearchLayout}` : "",
      `Property acquired from: ${
        quoteForm.acquisitionSource === "community"
          ? "Community"
          : quoteForm.acquisitionSource === "estate-developer"
            ? `Estate Developer${propertySourceName ? ` - ${propertySourceName}` : ""}`
            : quoteForm.acquisitionSource === "dajem"
              ? "Dajem"
              : `Others${propertySourceName ? ` - ${propertySourceName}` : ""}`
      }`,
      `Document submission checklist: ${quoteForm.uploadedDocuments.length > 0 ? quoteForm.uploadedDocuments.join(", ") : "No document selected"}`,
      storedAttachments.length > 0 ? `Attached files: ${storedAttachments.map((file) => `${file.documentName}: ${file.fileName} (${file.fileSizeKb} KB)${file.storagePath ? ` - stored at ${file.storagePath}` : ""}`).join(", ")}` : "",
      estimateNarrative ?? "",
    ].filter(Boolean);

    const attachmentSummary = storedAttachments.length > 0
      ? `${storedAttachments.length} file(s): ${storedAttachments.map((file) => `${file.documentName} - ${file.fileName}`).join(", ")}`
      : undefined;
    const totalAttachmentSize = storedAttachments.reduce((total, file) => total + file.fileSizeKb, 0);

    await submitSurvey({
      location: quoteForm.location,
      serviceType: getInquiryServiceLabel(quoteForm.serviceType),
      description: narrativeBlocks.join("\n\n"),
      fileName: attachmentSummary,
      fileSizeKb: totalAttachmentSize || undefined,
      acquisitionSource: quoteForm.acquisitionSource,
      acquisitionCompany: propertySourceName || undefined,
      hasExistingSurveyPlan: quoteForm.serviceType === "change-of-title" || quoteForm.hasExistingSurveyPlan === "yes",
      planNumber: quoteForm.planNumber,
      planYear: quoteForm.planYear,
      billingType,
      uploadedDocuments: quoteForm.uploadedDocuments,
      documentAttachments: storedAttachments,
      attested: quoteForm.attested,
      delivery: deliveryCheckout.added
        ? {
            provider: "DHL Express",
            serviceName: deliveryCheckout.serviceName,
            fee: deliveryCheckout.fee,
            currency: "NGN",
            rateSource: deliveryCheckout.rateSource,
            estimatedDelivery: deliveryCheckout.estimatedDelivery,
            recipientName: deliveryCheckout.recipientName,
            phone: deliveryCheckout.phone,
            email: deliveryCheckout.email.trim() || undefined,
            address: deliveryCheckout.address,
            city: deliveryCheckout.city,
            state: deliveryCheckout.state,
            postalCode: deliveryCheckout.postalCode.trim() || undefined,
            countryCode: "NG",
            status: "Rate Added",
          }
        : undefined,
    });

    setQuoteSent(true);
    setQuoteForm({
      location: "",
      serviceType: "perimeter",
      description: "",
      acquisitionSource: "dajem",
      acquisitionCompany: "",
      hasExistingSurveyPlan: "yes",
      planNumber: "",
      planYear: "",
      uploadedDocuments: [],
      attested: false,
      propertySearchLayout: "",
    });
    setUploadedFiles([]);
    setDeliveryCheckout({
      ...initialSurveyDelivery,
      recipientName: currentUser?.name ?? "",
      phone: currentUser?.phone ?? "",
      email: currentUser?.email ?? "",
    });
    setDeliveryEditor(null);
    setQuoteError(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="survey" />

      <main className="flex-1">
        <SubsidiaryNav label="DAJEM Orbital" items={orbitalNavItems} accent="cyan" />

        {activePageMeta && (
          <SubsidiaryPageIntro
            eyebrow={activePageMeta.eyebrow}
            title={activePageMeta.title}
            description={activePageMeta.description}
            accent="cyan"
          />
        )}

        {pageView === "home" && (
          <>
        <HeroSlideshow
          className="dajem-mobile-hero py-14 sm:py-20 lg:py-24"
          overlayClassName="bg-[linear-gradient(180deg,rgba(236,254,255,0.12),rgba(236,254,255,0.3),rgba(255,255,255,0.66))] dark:bg-[linear-gradient(180deg,rgba(8,47,73,0.12),rgba(2,6,23,0.38),rgba(2,6,23,0.72))]"
          slides={[
            { src: "/images/orbital-field-survey-1.jpg", position: "center", label: "Professional field survey", actionLabel: "Calculate survey cost", href: "/survey/estimate" },
            { src: "/images/orbital-field-survey-2.jpg", position: "center", label: "Site measurement and beacon work", actionLabel: "Submit a survey inquiry", href: "/survey/inquiry" },
            { src: "/images/orbital-hero-field-v2.png", position: "center", label: "Mapping, plans, and design", actionLabel: "Explore survey services", href: "/survey/services" },
            { src: "/images/orbital-hero-generated.png", position: "center", label: "Survey plan completion and delivery", actionLabel: "Track my survey job", href: "/survey/tracker" },
          ]}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 sm:px-6 lg:grid-cols-12 lg:gap-12">
            <div className="dajem-hero-copy-panel space-y-5 rounded-[1.75rem] p-5 sm:space-y-6 sm:p-8 lg:col-span-7">
              <Badge variant="secondary" className="border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/15">
                est. April, 2003
              </Badge>
              <h1 className="text-[2.55rem] font-bold leading-[0.98] sm:text-5xl">
                <span className="dajem-hero-title block">{profile.shortName}</span>
                <span className="mt-3 block text-[1.08rem] font-semibold leading-[1.3] tracking-tight text-slate-800 dark:text-slate-100 sm:text-[1.45rem]">
                  Surveying, mapping, design, construction, and logistics
                </span>
              </h1>
              <p className="dajem-hero-lede text-base leading-relaxed">
                Surveying, mapping, engineering, construction, and project support.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
                <Button size="lg" className="sheen-glow w-full sm:w-auto rounded-full bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-600/25 hover:bg-cyan-700 transition-all" onClick={() => router.push("/survey/inquiry")}>
                  Start Verification Portal
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-border/80 bg-background/60 hover:bg-background/90 text-foreground font-semibold shadow-sm backdrop-blur-md transition-all" onClick={() => router.push("/survey/estimate")}>
                  Cost Estimator
                </Button>
              </div>
            </div>

            <div className="dajem-hero-info-panel hidden space-y-5 rounded-[1.5rem] border p-5 shadow-xl backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:p-6 lg:col-span-5 lg:block">
              <h4 className="flex items-center gap-2 border-b pb-3 text-lg font-bold text-primary dark:text-foreground">
                <Sparkles className="h-5 w-5 text-cyan-500" />
                Company Profile
              </h4>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-xl border p-4">{profile.address}</div>
                <div className="rounded-xl border p-4">{profile.email}</div>
              </div>
            </div>
          </div>
        </HeroSlideshow>

        <TrustRibbon companyName={profile.displayName} registrationNumber={profile.registrationNumber} />

        <SubsidiaryRouteGrid
          title="Choose your Orbital workspace"
          accent="cyan"
          items={[
            { ...orbitalNavItems[1], meta: `${services.length} approved`, description: "Browse survey services." },
            { ...orbitalNavItems[2], meta: "Live calculation", description: "Calculate survey costs." },
            { ...orbitalNavItems[3], meta: "Documents ready", description: "Submit a formal request." },
            { ...orbitalNavItems[4], meta: `${userSurveys.length} requests`, description: "Track requests and delivery." },
          ]}
        />
          </>
        )}

        {pageView === "services" && (
        <section id="services" className="container mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-2">DAJEM Orbital Catalog</Badge>
            <h2 className="text-3xl font-bold text-primary dark:text-foreground">Approved Services</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Card key={service.title} className="flex h-full flex-col hover:-translate-y-1 duration-300">
                <CardHeader className="p-6">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${service.color}`}>
                    <service.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold leading-snug">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-0">
                  <p className="text-xs leading-relaxed text-muted-foreground">{service.description}</p>
                  <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    {service.priceFrom > 0 ? `From ${formatCurrency(service.priceFrom)} - ${service.timeline}` : service.timeline}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        )}

        {pageView === "estimate" && (
        <section id="calculator" className="border-y border-border bg-muted/30 py-10 sm:py-16">
          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-4 lg:grid-cols-2">
            <Card className="border bg-card p-5 shadow-lg sm:p-8">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-primary dark:text-foreground">
                <Calculator className="h-5 w-5 text-cyan-500" />
                Estimate Pricing Calculator
              </h3>
              <div className="space-y-4">
                <Select
                  label="Select Geomatics Survey"
                  value={calculatorInputs.serviceType}
                  onChange={(event) => setCalculatorValue("serviceType", event.target.value as CalculatorService)}
                  options={calculatorServiceOptions}
                />

                {renderSharedEstimatorFields(calculatorInputs.serviceType, "calculator")}

                <div className="mt-8 space-y-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-6">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Project Budget</p>
                    {calculatedEstimate.amount ? (
                      <p className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
                        {formatCurrency(calculatedEstimate.amount)}
                      </p>
                    ) : (
                      <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">Official Assessment Required</p>
                    )}
                    <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Info className="h-3 w-3 shrink-0 text-cyan-500" />
                      {calculatedEstimate.detail}
                    </p>
                  </div>

                  {calculatedEstimate.lineItems.length > 0 && (
                    <div className="rounded-lg border border-cyan-500/20 bg-background/80 p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction Summary</p>
                      <div className="mt-3 space-y-2">
                        {calculatedEstimate.lineItems.map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-cyan-500/20 bg-background/80 p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected Details</p>
                      <div className="mt-3 space-y-2">
                        {calculatedEstimate.selections.map((selection) => (
                          <p key={selection} className="text-muted-foreground">{selection}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-cyan-500/20 bg-background/80 p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Side Notes</p>
                      <div className="mt-3 space-y-2">
                        {calculatedEstimate.notes.length > 0 ? calculatedEstimate.notes.map((note) => (
                          <p key={note} className="text-muted-foreground">{note}</p>
                        )) : (
                          <p className="text-muted-foreground">Formal field assessment may still be required for the final operational quote.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
                    onClick={openInquiryFromEstimate}
                  >
                    Use This Estimate In Inquiry Desk
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-primary dark:text-foreground">Quick Tools</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <span>5-10 Days Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Registry-ready outputs</span>
                </div>
              </div>
              <div className="space-y-4 border-t pt-6">
                <h4 className="text-xl font-bold text-primary dark:text-foreground">Unit Converter</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                  <Select
                    label="From"
                    value={unitConverter.fromUnit}
                    onChange={(event) => setUnitConverter((current) => ({ ...current, fromUnit: event.target.value }))}
                    options={areaUnitOptions}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => setUnitConverter((current) => ({
                      ...current,
                      fromUnit: current.toUnit,
                      toUnit: current.fromUnit,
                    }))}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                  <Select
                    label="To"
                    value={unitConverter.toUnit}
                    onChange={(event) => setUnitConverter((current) => ({ ...current, toUnit: event.target.value }))}
                    options={areaUnitOptions}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="converter-quantity">Quantity</Label>
                    <Input
                      id="converter-quantity"
                      inputMode="decimal"
                      value={unitConverter.quantity}
                      onChange={(event) => setUnitConverter((current) => ({ ...current, quantity: event.target.value }))}
                    />
                  </div>
                  <div className="rounded-lg border bg-card/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Converted Value</p>
                    <p className="mt-1 text-lg font-extrabold text-cyan-600 dark:text-cyan-400">
                      {formatMeasurement(convertedQuantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {pageView === "inquiry" && (
        <section id="quote" className="container mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-16">
          <Card className="border bg-card p-5 shadow-xl sm:p-8">
            <Badge variant="secondary" className="mb-5">Inquiry Desk</Badge>

            <form onSubmit={handleQuoteSubmit} className="space-y-5">
              {!currentUser && (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  <p className="mb-3">Sign in to submit and track this request.</p>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={() => openAuthModal("login")}>Login</Button>
                    <Button type="button" variant="outline" onClick={() => openAuthModal("signup")}>
                      Create account
                    </Button>
                  </div>
                </div>
              )}

              <Select
                label="Desired Technical Service"
                value={quoteForm.serviceType}
                onChange={(event) => handleInquiryServiceChange(event.target.value)}
                options={inquiryServiceOptions}
              />

              {quoteForm.serviceType === "property-search" && (
                <Select
                  label="LANDS/ESTATE/LAYOUT"
                  value={quoteForm.propertySearchLayout}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, propertySearchLayout: event.target.value }))}
                  options={[
                    { value: "", label: "Select a property search target" },
                    ...propertySearchLayouts.map((layout) => ({ value: layout, label: layout })),
                  ]}
                />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="q-loc">Property Location / City</Label>
                  <Input
                    id="q-loc"
                    required
                    value={quoteForm.location}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  label="Property Acquired From"
                  value={quoteForm.acquisitionSource}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, acquisitionSource: event.target.value as AcquisitionSource, acquisitionCompany: "" }))}
                  options={[
                    { value: "community", label: "Community" },
                    { value: "estate-developer", label: "Estate Developer" },
                    { value: "dajem", label: "Dajem" },
                    { value: "other", label: "Others" },
                  ]}
                />
                {(quoteForm.acquisitionSource === "estate-developer" || quoteForm.acquisitionSource === "other") && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="source-name">
                      {quoteForm.acquisitionSource === "estate-developer" ? "Estate Developer Name" : "Person / Source Name"}
                    </Label>
                    <Input
                      id="source-name"
                      required={quoteForm.acquisitionSource === "other"}
                      value={quoteForm.acquisitionCompany}
                      onChange={(event) => setQuoteForm((current) => ({ ...current, acquisitionCompany: event.target.value }))}
                    />
                  </div>
                )}
                {quoteForm.serviceType !== "change-of-title" && quoteForm.acquisitionSource !== "estate-developer" && quoteForm.acquisitionSource !== "other" && (
                  <Select
                    label="Existing Survey Plan"
                    value={quoteForm.hasExistingSurveyPlan}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, hasExistingSurveyPlan: event.target.value }))}
                    options={[
                      { value: "yes", label: "Yes - Existing survey plan available" },
                      { value: "no", label: "No - No existing survey plan" },
                    ]}
                  />
                )}
              </div>

              {quoteForm.serviceType !== "change-of-title" && (quoteForm.acquisitionSource === "estate-developer" || quoteForm.acquisitionSource === "other") && (
                <Select
                  label="Existing Survey Plan"
                  value={quoteForm.hasExistingSurveyPlan}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, hasExistingSurveyPlan: event.target.value }))}
                  options={[
                    { value: "yes", label: "Yes - Existing survey plan available" },
                    { value: "no", label: "No - No existing survey plan" },
                  ]}
                />
              )}

              {quoteForm.serviceType === "change-of-title" && (
                <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Change of Title requires an existing survey plan. Add the plan number and year below when available.
                </div>
              )}

              {quoteForm.hasExistingSurveyPlan === "yes" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="plan-number">Survey Plan Number</Label>
                    <Input
                      id="plan-number"
                      placeholder="CEE/EN/123/1234"
                      value={quoteForm.planNumber}
                      onChange={(event) => setQuoteForm((current) => ({ ...current, planNumber: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="plan-year">Survey Plan Year</Label>
                    <Input
                      id="plan-year"
                      type="number"
                      value={quoteForm.planYear}
                      onChange={(event) => setQuoteForm((current) => ({ ...current, planYear: event.target.value }))}
                    />
                  </div>
                </div>
              )}

              {isCalculatorService(quoteForm.serviceType) && (
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">Linked Estimate Details</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => router.push("/survey/estimate")}>
                      Review Main Estimator
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {renderSharedEstimatorFields(quoteForm.serviceType, "quote")}

                    {linkedInquiryEstimate && (
                      <div className="space-y-4 rounded-lg border bg-background/70 p-4 text-sm">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimator Detail</p>
                          <p className="mt-2 font-semibold text-foreground">{linkedInquiryEstimate.detail}</p>
                          {linkedInquiryEstimate.amount !== null && (
                            <p className="mt-2 text-lg font-extrabold text-cyan-600 dark:text-cyan-400">
                              {formatCurrency(linkedInquiryEstimate.amount)}
                            </p>
                          )}
                        </div>

                        {linkedInquiryEstimate.lineItems.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transactions Summary</p>
                            <div className="mt-2 space-y-2">
                              {linkedInquiryEstimate.lineItems.map((item) => (
                                <div key={item.label} className="flex items-center justify-between gap-4">
                                  <span className="text-muted-foreground">{item.label}</span>
                                  <span className="font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected Details</p>
                            <div className="mt-2 space-y-2">
                              {linkedInquiryEstimate.selections.map((selection) => (
                                <p key={selection} className="text-muted-foreground">{selection}</p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Side Notes</p>
                            <div className="mt-2 space-y-2">
                              {linkedInquiryEstimate.notes.length > 0 ? linkedInquiryEstimate.notes.map((note) => (
                                <p key={note} className="text-muted-foreground">{note}</p>
                              )) : (
                                <p className="text-muted-foreground">Formal field assessment may still be required.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="q-desc">Other Details</Label>
                <Textarea
                  id="q-desc"
                  rows={4}
                  required
                  value={quoteForm.description}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="mb-3">
                  <div>
                    <p className="font-semibold text-foreground">Document Submission Checklist</p>
                    <p className="text-xs text-muted-foreground">Select the document you are adding for this device.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {documentSubmissionOptions.map((documentName) => (
                    <label key={documentName} className="flex items-center gap-3 rounded-lg border bg-background/70 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={quoteForm.uploadedDocuments.includes(documentName)}
                        onChange={(event) => toggleSubmittedDocument(documentName, event.target.checked)}
                      />
                      <span>{documentName}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Summary</p>
                  <p>1. Land Purchase Receipt.</p>
                  <p>2. Allocation Letter.</p>
                  <p>3. Deed of Lease/Assignment/Conveyance/Gift.</p>
                  <p>4. Irrevocable Power Of Attorney.</p>
                  <p>5. Old Survey Plan.</p>
                  <p>6. Others.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Attach All Selected Documents</Label>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-6 transition-colors ${dragActive ? "border-cyan-500 bg-cyan-500/10" : "border-border bg-muted/40"}`}
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="rounded-full bg-background p-3 shadow-sm">
                      {uploadedFiles.length > 0 ? <FileUp className="h-5 w-5 text-cyan-600" /> : <UploadCloud className="h-5 w-5 text-cyan-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) attached` : "Drop documents here or upload from your device"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {uploadedFiles.length > 0 ? "Each selected document should have a matching attachment." : "PDF, JPG, or PNG up to 5MB each"}
                      </p>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="w-full rounded-lg border bg-background/70 p-3 text-left text-xs text-muted-foreground">
                        {uploadedFiles.map((file) => (
                          <p key={`${file.documentName}-${file.fileName}`}>{file.documentName}: {file.fileName} - {file.fileSizeKb} KB</p>
                        ))}
                      </div>
                    )}
                    {quoteForm.uploadedDocuments.length > 0 && (
                      <div className="grid w-full gap-3 text-left sm:grid-cols-2">
                        {quoteForm.uploadedDocuments.map((documentName) => {
                          const attachment = uploadedFiles.find((file) => file.documentName === documentName);

                          return (
                            <div key={documentName} className="rounded-lg border bg-background/70 p-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{documentName}</p>
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(event) => setDocumentAttachment(documentName, event.target.files?.[0])}
                              />
                              {attachment && (
                                <p className="mt-2 text-xs text-muted-foreground">{attachment.fileName} - {attachment.fileSizeKb} KB</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(event) => {
                          setUploadedFiles(buildFilesFromList(event.target.files));
                          setQuoteError(null);
                        }}
                      />
                      {uploadedFiles.length > 0 && (
                        <Button type="button" variant="ghost" onClick={() => setUploadedFiles([])}>
                          Remove Files
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {quoteError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {quoteError}
                </div>
              )}

              <label className="flex gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={quoteForm.attested}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, attested: event.target.checked }))}
                  required
                />
                <span>I attest that every information submitted is true, accurate and legally binding. I understand that processing may take 24 hours for research reports to come out.</span>
              </label>

              <Button type="submit" className="w-full bg-cyan-600 text-white hover:bg-cyan-700" disabled={!quoteForm.attested}>
                Submit Verification Request
              </Button>
            </form>
          </Card>
        </section>
        )}

        {pageView === "tracker" && (
        <section id="tracker" className="container mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16">
          {userSurveys.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Submitted survey requests will appear here and in the shared dashboard.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userSurveys.map((survey) => (
                <Card key={survey.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-lg">{survey.location}</CardTitle>
                      <Badge variant={survey.status === "Completed & Sent" ? "default" : survey.status === "Rejected" ? "destructive" : survey.status === "In Progress" ? "secondary" : "outline"}>
                        {survey.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs font-semibold text-cyan-600">{survey.applicationNumber ?? survey.id}</p>
                    <p className="text-sm text-muted-foreground">{survey.serviceType}</p>
                    <details className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                      <summary className="cursor-pointer font-semibold text-foreground">View submitted details</summary>
                      <p className="mt-3 whitespace-pre-line">{survey.description}</p>
                    </details>
                    {survey.billingType && (
                      <Badge variant="outline">{survey.billingType}</Badge>
                    )}
                    {survey.uploadedDocuments && survey.uploadedDocuments.length > 0 && (
                      <p className="text-xs text-muted-foreground">Documents selected: {survey.uploadedDocuments.join(", ")}</p>
                    )}
                    {survey.documentAttachments && survey.documentAttachments.length > 0 && (
                      <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                        {survey.documentAttachments.map((attachment) => (
                          <div key={`${attachment.documentName}-${attachment.fileName}`} className="space-y-0.5">
                            <p>{attachment.documentName}: {attachment.fileName} ({attachment.fileSizeKb} KB)</p>
                            {attachment.storagePath && (
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Stored: {attachment.storagePath}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {survey.delivery && (
                      <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 dark:border-red-950 dark:bg-red-950/20">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-2.5">
                            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-300" />
                            <div>
                              <p className="text-sm font-bold text-red-950 dark:text-red-100">DHL survey plan delivery</p>
                              <p className="mt-1 text-xs text-red-900/80 dark:text-red-100/80">
                                {survey.delivery.address}, {survey.delivery.city}, {survey.delivery.state}
                                {survey.delivery.postalCode ? ` ${survey.delivery.postalCode}` : ""}
                              </p>
                              <p className="mt-1 text-xs text-red-900/80 dark:text-red-100/80">
                                {survey.delivery.estimatedDelivery}
                                {survey.delivery.trackingNumber ? ` · Tracking: ${survey.delivery.trackingNumber}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-black text-red-950 dark:text-red-100">{formatCurrency(survey.delivery.fee)}</p>
                            <Badge variant="outline" className="mt-1 border-red-300 text-red-900 dark:border-red-800 dark:text-red-100">
                              {survey.delivery.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                    {survey.paymentStatus && (
                      <p className="text-xs font-semibold text-primary">Payment: {survey.paymentStatus}</p>
                    )}
                    {survey.processingNote && (
                      <p className="text-xs text-muted-foreground">{survey.processingNote}</p>
                    )}
                    {survey.fileName && (
                      <p className="text-xs text-muted-foreground">Attached: {survey.fileName}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
        )}
      </main>

      <Footer compact />

      <Dialog isOpen={quoteSent} onClose={() => setQuoteSent(false)} title="Quotation Request Logged">
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Survey request logged</p>
            <p className="text-sm text-muted-foreground">
              Your request is now pending approval. An email preview has been saved in your dashboard while real email delivery is prepared later.
            </p>
          </div>
          <Button className="bg-primary text-white" onClick={() => setQuoteSent(false)}>
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

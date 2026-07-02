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
  Info,
  Layers,
  Map,
  Ruler,
  Sparkles,
  UploadCloud,
} from "lucide-react";

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

type CalculatorService = "perimeter" | "parcellation" | "topography" | "control" | "detail" | "engineering" | "litigation" | "reestablishment";
type ClientType = "private" | "corporate";
type DetailDensity = "low" | "medium" | "high";
type TopographyTerrain = "open-savannah" | "deciduous" | "swamp";

const technicalServiceOptions: { value: CalculatorService; label: string }[] = [
  { value: "perimeter", label: "Perimeter Surveys" },
  { value: "parcellation", label: "Estate Parcellation Surveys" },
  { value: "topography", label: "Topography Surveys (Contouring)" },
  { value: "control", label: "Control Surveys" },
  { value: "detail", label: "Detail Surveys" },
  { value: "engineering", label: "Engineering Surveys" },
  { value: "litigation", label: "Litigation (Dispute) Surveys" },
  { value: "reestablishment", label: "Re-establishment Surveys" },
];

const serviceFeeOptions = technicalServiceOptions.map((service) => service.label);
const defaultTechnicalService = technicalServiceOptions[0].label;

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

function calculatePerimeterEstimate(squareMetres: number, clientType: ClientType) {
  const row = findFeeRow(perimeterFeeTable, squareMetres);
  if (row) return { amount: row[clientType], detail: `${row.label} ${clientType === "private" ? "Private/Individual" : "Corporate"} rate` };

  if (squareMetres > 500000) {
    const base = perimeterFeeTable[perimeterFeeTable.length - 1][clientType];
    const extraHectares = Math.ceil(squareMetres / 10000 - 50);
    const extraRate = clientType === "private" ? 50000 : 70000;
    return { amount: base + extraHectares * extraRate, detail: `46Ha - 50Ha base plus ${extraHectares} additional hectare(s)` };
  }

  return null;
}

function calculateParcellationEstimate(plotCount: number) {
  const plots = Math.ceil(plotCount);
  const band = parcellationFeeBands.find((entry) => plots <= entry.max);
  if (band) return { amount: plots * band.rate, detail: `${plots} plot(s) at ${formatCurrency(band.rate)} per plot` };

  const amount = 100 * 100000 + (plots - 100) * 50000;
  return { amount, detail: "100 plots at N100,000 per plot plus N50,000 for each additional plot" };
}

function calculateTopographyEstimate(squareMetres: number, terrain: TopographyTerrain) {
  const terrainFactor = terrain === "deciduous" ? 1.5 : terrain === "swamp" ? 2 : 1;
  const row = findFeeRow(topographyFeeTable, squareMetres);
  const base = row
    ? row.amount
    : squareMetres > 500000
      ? topographyFeeTable[topographyFeeTable.length - 1].amount + Math.ceil(squareMetres / 10000 - 50) * 100000
      : 0;
  if (!base) return null;

  const terrainLabel = terrain === "open-savannah" ? "Open Savannah" : terrain === "deciduous" ? "Deciduous x1.5" : "Swamp Area x2";
  return { amount: Math.round(base * terrainFactor), detail: `${row?.label ?? "Above 50Ha"} ${terrainLabel}` };
}

function calculateDetailEstimate(squareMetres: number, density: DetailDensity) {
  const factor = density === "medium" ? 1.5 : density === "high" ? 2 : 1;
  const row = detailLowDensityTable.find((entry) => squareMetres <= entry.max);
  const lowDensityBase = row
    ? row.amount
    : detailLowDensityTable[detailLowDensityTable.length - 1].amount + Math.ceil((squareMetres - 10000) / 10000) * 100000;
  const densityLabel = density === "low" ? "Low Density" : density === "medium" ? "Medium Density x1.5" : "High Density x2";
  return { amount: Math.round(lowDensityBase * factor), detail: densityLabel };
}

function calculateLitigationEstimate(squareMetres: number, clientType: ClientType, courtAppearance: string) {
  const row = findFeeRow(litigationFeeTable, squareMetres);
  const base = row
    ? row[clientType]
    : squareMetres > 500000
      ? litigationFeeTable[litigationFeeTable.length - 1][clientType] + Math.ceil(squareMetres / 10000 - 50) * 100000
      : 0;
  if (!base) return null;

  const courtFee = courtAppearance === "yes" ? clientType === "private" ? 150000 : 200000 : 0;
  return {
    amount: base + courtFee,
    detail: `${row?.label ?? "Above 50Ha"}${courtFee ? ` plus ${formatCurrency(courtFee)} court appearance minimum` : ""}`,
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
}) {
  if (inputs.serviceType === "parcellation") {
    const plots = parsePositiveNumber(inputs.plotCount);
    if (!plots) return { amount: null, detail: "Enter number of plots to calculate the estimate." };
    return calculateParcellationEstimate(plots);
  }

  const squareMetres = toSquareMetres(inputs.parcelSize, inputs.parcelUnit);
  if (!squareMetres && ["perimeter", "topography", "detail", "litigation"].includes(inputs.serviceType)) {
    return { amount: null, detail: "Enter parcel size to calculate the estimate." };
  }

  if (inputs.serviceType === "perimeter") {
    return calculatePerimeterEstimate(squareMetres, inputs.clientType) ?? { amount: null, detail: "Enter a parcel size within the supported perimeter survey table." };
  }

  if (inputs.serviceType === "topography") {
    return calculateTopographyEstimate(squareMetres, inputs.topographyTerrain) ?? { amount: null, detail: "Enter a parcel size within the supported topography survey table." };
  }

  if (inputs.serviceType === "detail") {
    return calculateDetailEstimate(squareMetres, inputs.detailDensity);
  }

  if (inputs.serviceType === "litigation") {
    return calculateLitigationEstimate(squareMetres, inputs.clientType, inputs.courtAppearance) ?? { amount: null, detail: "Enter a parcel size within the supported litigation survey table." };
  }

  return { amount: null, detail: "Formal assessment is required for this selected service." };
}

const newSurveyDocuments = ["C of O", "Deed of Assignment", "Power of Attorney", "Allocation Letter"];
const existingSurveyDocuments = ["Old Survey Plan", "Deed of Assignment", "Deed of Lease", "Power of Attorney"];
const surveyDeliveryFees = {
  enugu: 10000,
  southeast: 15000,
  other: 20000,
};

export default function SurveyPage() {
  const profile = dajemCompanyProfiles.survey;
  const { currentUser, openAuthModal, requireAuth, snapshot, submitSurvey } = useDajem();
  const [calculatorInputs, setCalculatorInputs] = React.useState({
    serviceType: "perimeter" as CalculatorService,
    clientType: "private" as ClientType,
    parcelSize: "600",
    parcelUnit: "sqm",
    plotCount: "5",
    topographyTerrain: "open-savannah" as TopographyTerrain,
    detailDensity: "low" as DetailDensity,
    courtAppearance: "no",
    terrain: "flat",
    deliveryZone: "enugu",
  });
  const [unitConverter, setUnitConverter] = React.useState({
    fromUnit: "sqm",
    toUnit: "hectare",
    quantity: "1000",
  });
  const [quoteForm, setQuoteForm] = React.useState({
    location: "",
    serviceType: defaultTechnicalService,
    description: "",
    acquisitionSource: "former-owner",
    acquisitionCompany: "DAJEM Orbital Resources Limited",
    hasExistingSurveyPlan: "yes",
    planNumber: "",
    planYear: "",
    uploadedDocuments: [] as string[],
    attested: false,
  });
  const [uploadedFile, setUploadedFile] = React.useState<{ name: string; sizeKb: number } | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [quoteSent, setQuoteSent] = React.useState(false);
  const calculatedEstimate = calculateSurveyEstimate(calculatorInputs);

  const serviceIcons = [Ruler, Compass, Map, Layers];
  const services = snapshot.surveyServices
    .filter((service) => service.status === "Approved")
    .map((service, index) => ({
      ...service,
      icon: serviceIcons[index % serviceIcons.length],
    }));

  const userSurveys = currentUser ? snapshot.surveys.filter((survey) => survey.userEmail === currentUser.email) : [];
  const requiredDocuments = quoteForm.hasExistingSurveyPlan === "yes" ? existingSurveyDocuments : newSurveyDocuments;
  const missingDocuments = requiredDocuments.filter((documentName) => !quoteForm.uploadedDocuments.includes(documentName));
  const billingType = quoteForm.hasExistingSurveyPlan === "yes" ? "Change of Title" : "New Survey";
  const selectedDeliveryFee = surveyDeliveryFees[calculatorInputs.deliveryZone as keyof typeof surveyDeliveryFees];
  const convertedQuantity = fromSquareMetres(
    toSquareMetres(unitConverter.quantity, unitConverter.fromUnit),
    unitConverter.toUnit,
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    setUploadedFile({ name: file.name, sizeKb: Math.round(file.size / 1024) });
  };

  const handleQuoteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireAuth("signup")) return;
    if (!quoteForm.attested) return;

    await submitSurvey({
      location: quoteForm.location,
      serviceType: quoteForm.serviceType,
      description: quoteForm.description,
      fileName: uploadedFile?.name,
      fileSizeKb: uploadedFile?.sizeKb,
      acquisitionSource: quoteForm.acquisitionSource,
      acquisitionCompany: quoteForm.acquisitionSource === "company" ? quoteForm.acquisitionCompany : undefined,
      hasExistingSurveyPlan: quoteForm.hasExistingSurveyPlan === "yes",
      planNumber: quoteForm.planNumber,
      planYear: quoteForm.planYear,
      billingType,
      uploadedDocuments: quoteForm.uploadedDocuments,
      missingDocuments,
      attested: quoteForm.attested,
    });

    setQuoteSent(true);
    setQuoteForm({
      location: "",
      serviceType: defaultTechnicalService,
      description: "",
      acquisitionSource: "former-owner",
      acquisitionCompany: "DAJEM Orbital Resources Limited",
      hasExistingSurveyPlan: "yes",
      planNumber: "",
      planYear: "",
      uploadedDocuments: [],
      attested: false,
    });
    setUploadedFile(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="survey" />

      <main className="flex-1">
        <HeroSlideshow
          className="py-24"
          overlayClassName="bg-[linear-gradient(180deg,rgba(236,254,255,0.12),rgba(236,254,255,0.3),rgba(255,255,255,0.66))] dark:bg-[linear-gradient(180deg,rgba(8,47,73,0.12),rgba(2,6,23,0.38),rgba(2,6,23,0.72))]"
          slides={[
            { src: "/images/orbital-field-survey-1.jpg", position: "center" },
            { src: "/images/orbital-field-survey-2.jpg", position: "center" },
            { src: "/images/orbital-hero-field-v2.png", position: "center" },
            { src: "/images/orbital-hero-generated.png", position: "center" },
          ]}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <Badge variant="secondary" className="bg-cyan-100 px-3 py-1 font-semibold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                est. April, 2003
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary dark:text-foreground sm:text-5xl">
                {profile.displayName}: Surveying, Mapping, Design, Construction, Logistics, and Contracts
              </h1>
              <div className="text-base leading-relaxed text-muted-foreground">
                <p>{profile.summary}</p>
                <p className="mt-8 pt-2">Submit a request, receive pending approval, and track admin updates from your shared dashboard.</p>
              </div>
              <div className="flex gap-4 pt-2">
                <Button size="lg" className="bg-cyan-600 text-white hover:bg-cyan-700" onClick={() => document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" })}>
                  Start Verification Portal
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}>
                  Cost Estimator
                </Button>
              </div>
            </div>

            <div className="space-y-6 rounded-2xl border bg-card/78 p-6 shadow-xl backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 lg:col-span-5">
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

        <section id="services" className="container mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-2">DAJEM Orbital Catalog</Badge>
            <h2 className="text-3xl font-bold text-primary dark:text-foreground">Approved Services</h2>
            <p className="mt-1 text-sm text-muted-foreground">Services are managed from the unified admin portal and displayed here after approval.</p>
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

        <section id="calculator" className="border-y border-border bg-muted/30 py-20">
          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
            <Card className="border bg-card p-8 shadow-lg">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-primary dark:text-foreground">
                <Calculator className="h-5 w-5 text-cyan-500" />
                Estimate Pricing Calculator
              </h3>
              <div className="space-y-4">
                <Select
                  label="Select Geomatics Survey"
                  value={calculatorInputs.serviceType}
                  onChange={(event) => setCalculatorInputs((current) => ({ ...current, serviceType: event.target.value as CalculatorService }))}
                  options={technicalServiceOptions}
                />
                {(calculatorInputs.serviceType === "perimeter" || calculatorInputs.serviceType === "litigation") && (
                  <Select
                    label="Client Type"
                    value={calculatorInputs.clientType}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, clientType: event.target.value as ClientType }))}
                    options={[
                      { value: "private", label: "Private/Individual" },
                      { value: "corporate", label: "Corporate" },
                    ]}
                  />
                )}

                {calculatorInputs.serviceType === "topography" && (
                  <Select
                    label="Topography Area Type"
                    value={calculatorInputs.topographyTerrain}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, topographyTerrain: event.target.value as TopographyTerrain }))}
                    options={[
                      { value: "open-savannah", label: "Open Savannah" },
                      { value: "deciduous", label: "Deciduous" },
                      { value: "swamp", label: "Swamp Area" },
                    ]}
                  />
                )}

                {calculatorInputs.serviceType === "detail" && (
                  <Select
                    label="Density"
                    value={calculatorInputs.detailDensity}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, detailDensity: event.target.value as DetailDensity }))}
                    options={[
                      { value: "low", label: "Low Density" },
                      { value: "medium", label: "Medium Density" },
                      { value: "high", label: "High Density" },
                    ]}
                  />
                )}

                {calculatorInputs.serviceType === "litigation" && (
                  <Select
                    label="Court Appearance"
                    value={calculatorInputs.courtAppearance}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, courtAppearance: event.target.value }))}
                    options={[
                      { value: "no", label: "No" },
                      { value: "yes", label: "Yes" },
                    ]}
                  />
                )}

                {calculatorInputs.serviceType === "parcellation" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="plot-count">Number Of Plots</Label>
                    <Input
                      id="plot-count"
                      inputMode="numeric"
                      min="1"
                      type="number"
                      value={calculatorInputs.plotCount}
                      onChange={(event) => setCalculatorInputs((current) => ({ ...current, plotCount: event.target.value }))}
                    />
                  </div>
                ) : ["perimeter", "topography", "detail", "litigation"].includes(calculatorInputs.serviceType) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_0.85fr]">
                    <div className="space-y-1.5">
                      <Label htmlFor="parcel-size">Land Size</Label>
                      <Input
                        id="parcel-size"
                        inputMode="decimal"
                        placeholder="600"
                        value={calculatorInputs.parcelSize}
                        onChange={(event) => setCalculatorInputs((current) => ({ ...current, parcelSize: event.target.value }))}
                      />
                    </div>
                    <Select
                      label="Unit"
                      value={calculatorInputs.parcelUnit}
                      onChange={(event) => setCalculatorInputs((current) => ({ ...current, parcelUnit: event.target.value }))}
                      options={areaUnitOptions}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Terrain Profile"
                    value={calculatorInputs.terrain}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, terrain: event.target.value }))}
                    options={[
                      { value: "flat", label: "Flat/table land" },
                      { value: "hilly", label: "Hilly / Mountainous" },
                      { value: "swampy", label: "Swamp / Waterlogged" },
                    ]}
                  />
                  <Select
                    label="Survey Plan Delivery"
                    value={calculatorInputs.deliveryZone}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, deliveryZone: event.target.value }))}
                    options={[
                      { value: "enugu", label: "Within Enugu State - N10,000" },
                      { value: "southeast", label: "Abia, Imo, Anambra or Ebonyi - N15,000" },
                      { value: "other", label: "Other States - N20,000" },
                    ]}
                  />
                </div>
                <div className="mt-8 space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Project Budget</p>
                  {calculatedEstimate.amount ? (
                    <p className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
                      {formatCurrency(calculatedEstimate.amount)}
                    </p>
                  ) : (
                    <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">Official Assessment Required</p>
                  )}
                  <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Info className="h-3 w-3 shrink-0 text-cyan-500" />
                    {calculatedEstimate.detail}
                  </p>
                  <div className="mt-4 rounded-lg border border-cyan-500/20 bg-background/70 p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Survey Plan Delivery Available</p>
                    <p className="mt-1 font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(selectedDeliveryFee)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Badge variant="secondary">Cost Parameters</Badge>
              <h3 className="text-3xl font-bold text-primary dark:text-foreground">Transparent Survey Fees</h3>
              <p className="leading-relaxed text-muted-foreground">
                Costs change with terrain difficulty, accessibility, vegetation density, and registry requirements. The estimator gives a close operational range before field inspection.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t pt-6 text-xs font-bold text-muted-foreground">
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
                <div>
                  <Badge variant="secondary">Unit Converter</Badge>
                  <h4 className="mt-2 text-xl font-bold text-primary dark:text-foreground">Convert Survey Units</h4>
                </div>
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

        <section id="quote" className="container mx-auto max-w-4xl px-4 py-20">
          <Card className="border bg-card p-8 shadow-xl">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <Badge variant="secondary" className="mb-2">Inquiry Desk</Badge>
              <h3 className="text-2xl font-bold text-primary dark:text-foreground">Request Formal Survey Proposal</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Attach any old allocation letters or layouts and follow the request from your shared dashboard.
              </p>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              {!currentUser && (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  <p className="mb-3">Sign in first so we can attach this request to your shared dashboard and tracker.</p>
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
                onChange={(event) => setQuoteForm((current) => ({ ...current, serviceType: event.target.value }))}
                options={serviceFeeOptions.map((service) => ({ value: service, label: service }))}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="q-loc">Land Location / City</Label>
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
                  label="Land Acquired From"
                  value={quoteForm.acquisitionSource}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, acquisitionSource: event.target.value }))}
                  options={[
                    { value: "former-owner", label: "Former Owner" },
                    { value: "agent", label: "Agent" },
                    { value: "company", label: "Company" },
                    { value: "other", label: "Other" },
                  ]}
                />
                {quoteForm.acquisitionSource === "company" && (
                  <Select
                    label="Company"
                    value={quoteForm.acquisitionCompany}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, acquisitionCompany: event.target.value }))}
                    options={[
                      { value: "DAJEM Orbital Resources Limited", label: "DAJEM Orbital Resources Limited" },
                      { value: "DAJEM Homes Limited", label: "DAJEM Homes Limited" },
                      { value: "Others", label: "Others" },
                    ]}
                  />
                )}
                <Select
                  label="Existing Survey Plan"
                  value={quoteForm.hasExistingSurveyPlan}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, hasExistingSurveyPlan: event.target.value, uploadedDocuments: [] }))}
                  options={[
                    { value: "yes", label: "Yes - Change of Title" },
                    { value: "no", label: "No - New Survey" },
                  ]}
                />
              </div>

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
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Document Checklist</p>
                    <p className="text-xs text-muted-foreground">Missing documents are saved in your profile and request tracker.</p>
                  </div>
                  <Badge variant="outline">{billingType}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {requiredDocuments.map((documentName) => (
                    <label key={documentName} className="flex items-center gap-3 rounded-lg border bg-background/70 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={quoteForm.uploadedDocuments.includes(documentName)}
                        onChange={(event) => setQuoteForm((current) => ({
                          ...current,
                          uploadedDocuments: event.target.checked
                            ? [...current.uploadedDocuments, documentName]
                            : current.uploadedDocuments.filter((item) => item !== documentName),
                        }))}
                      />
                      <span>{documentName}</span>
                    </label>
                  ))}
                </div>
                {missingDocuments.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">Not yet uploaded: {missingDocuments.join(", ")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Attach Allocation Letter / Old Survey (Optional)</Label>
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
                      {uploadedFile ? <FileUp className="h-5 w-5 text-cyan-600" /> : <UploadCloud className="h-5 w-5 text-cyan-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {uploadedFile ? uploadedFile.name : "Drop a document here or simulate an upload"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {uploadedFile ? `${uploadedFile.sizeKb} KB attached` : "PDF, JPG, or PNG up to 5MB"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) setUploadedFile({ name: file.name, sizeKb: Math.round(file.size / 1024) });
                        }}
                      />
                      {uploadedFile && (
                        <Button type="button" variant="ghost" onClick={() => setUploadedFile(null)}>
                          Remove File
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={quoteForm.attested}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, attested: event.target.checked }))}
                  required
                />
                <span>I attest that every information submitted is true , accurate and legally binding , I understand that processing may take 24hrs for research reports to come out</span>
              </label>

              <Button type="submit" className="w-full bg-cyan-600 text-white hover:bg-cyan-700" disabled={!quoteForm.attested}>
                Submit Verification Request
              </Button>
            </form>
          </Card>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">Live Tracker</Badge>
              <h3 className="text-2xl font-bold text-primary dark:text-foreground">Your Survey Requests</h3>
            </div>
          </div>
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
                    <p className="text-sm text-muted-foreground">{survey.description}</p>
                    {survey.billingType && (
                      <Badge variant="outline">{survey.billingType}</Badge>
                    )}
                    {survey.paymentStatus && (
                      <p className="text-xs font-semibold text-primary">Payment: {survey.paymentStatus}</p>
                    )}
                    {survey.processingNote && (
                      <p className="text-xs text-muted-foreground">{survey.processingNote}</p>
                    )}
                    {survey.missingDocuments && survey.missingDocuments.length > 0 && (
                      <p className="text-xs text-muted-foreground">Missing documents: {survey.missingDocuments.join(", ")}</p>
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
      </main>

      <Footer />

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

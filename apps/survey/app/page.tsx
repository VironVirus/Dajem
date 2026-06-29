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

const serviceFeeOptions = [
  "Property Search - N20,000 per lodgement, maximum of 3 plots per search",
  "Property Site Inspection - N50,000 per plot",
  "Reestablishment of Survey Beacons and Capping - N20,000 per plot",
  "Perimeter Survey / Boundary Survey - Based on scale of fees",
  "Topography / Detail Survey - Based on scale of fees booklet",
  "Estate / Layout Survey - Based on scale of fees booklet",
  "Estate / Layout Designs - Based on official meeting",
  "Digital Mapping and Geoinformatics - Based on official meeting",
  "Architectural Designs - Based on official meeting",
  "Dispute Surveys and Others - Based on official meeting",
];

const newSurveyDocuments = ["C of O", "Deed of Assignment", "Power of Attorney", "Allocation Letter"];
const existingSurveyDocuments = ["Old Survey Plan", "Deed of Assignment", "Deed of Lease", "Power of Attorney"];

export default function SurveyPage() {
  const profile = dajemCompanyProfiles.survey;
  const { currentUser, openAuthModal, requireAuth, snapshot, submitSurvey } = useDajem();
  const [calculatorInputs, setCalculatorInputs] = React.useState({
    serviceType: "boundary",
    size: "1-plot",
    terrain: "flat",
  });
  const [quoteForm, setQuoteForm] = React.useState({
    location: "",
    serviceType: serviceFeeOptions[0],
    description: "",
    acquisitionSource: "former-owner",
    acquisitionCompany: "Dajem Orbital Resources Limited",
    hasExistingSurveyPlan: "no",
    planNumber: "",
    planYear: "",
    uploadedDocuments: [] as string[],
    attested: false,
  });
  const [uploadedFile, setUploadedFile] = React.useState<{ name: string; sizeKb: number } | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [quoteSent, setQuoteSent] = React.useState(false);
  const [calculatedEstimate, setCalculatedEstimate] = React.useState({ min: 150000, max: 180000 });

  React.useEffect(() => {
    let basePrice = 150000;
    if (calculatorInputs.serviceType === "topo") basePrice = 250000;
    if (calculatorInputs.serviceType === "architectural") basePrice = 450000;
    if (calculatorInputs.serviceType === "gis") basePrice = 300000;

    let sizeMultiplier = 1;
    if (calculatorInputs.size === "1-acre") sizeMultiplier = 3.5;
    if (calculatorInputs.size === "5-acres") sizeMultiplier = 12;
    if (calculatorInputs.size === "10-acres-plus") sizeMultiplier = 20;

    let terrainMultiplier = 1;
    if (calculatorInputs.terrain === "hilly") terrainMultiplier = 1.25;
    if (calculatorInputs.terrain === "swampy") terrainMultiplier = 1.45;

    const finalBase = basePrice * sizeMultiplier * terrainMultiplier;
    setCalculatedEstimate({
      min: Math.round(finalBase * 0.95),
      max: Math.round(finalBase * 1.1),
    });
  }, [calculatorInputs]);

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
  const billingType = quoteForm.hasExistingSurveyPlan === "yes" ? "Change of Title" : "Full Survey";

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
      serviceType: serviceFeeOptions[0],
      description: "",
      acquisitionSource: "former-owner",
      acquisitionCompany: "Dajem Orbital Resources Limited",
      hasExistingSurveyPlan: "no",
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
          overlayClassName="bg-[linear-gradient(180deg,rgba(236,254,255,0.3),rgba(236,254,255,0.54),rgba(255,255,255,0.84))] dark:bg-[linear-gradient(180deg,rgba(8,47,73,0.24),rgba(2,6,23,0.58),rgba(2,6,23,0.84))]"
          slides={[
            { src: "/images/orbital-hero-field-v2.png", position: "center" },
            { src: "/images/orbital-hero-generated.png", position: "center" },
          ]}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <Badge variant="secondary" className="bg-cyan-100 px-3 py-1 font-semibold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                Started {profile.startDate}
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary dark:text-foreground sm:text-5xl">
                {profile.displayName}: Surveying, Mapping, Design, Construction, Logistics, and Contracts
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                {profile.summary} Submit a request, receive pending approval, and track admin updates from your shared dashboard.
              </p>
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
                <div className="rounded-xl border p-4">Requests are saved as pending approval and email previews are logged for later delivery.</div>
              </div>
            </div>
          </div>
        </HeroSlideshow>

        <section id="services" className="container mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-2">Dajem Orbital Catalog</Badge>
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
                  label="Select Geomatics Service"
                  value={calculatorInputs.serviceType}
                  onChange={(event) => setCalculatorInputs((current) => ({ ...current, serviceType: event.target.value }))}
                  options={[
                    { value: "boundary", label: "Boundary Survey & Beacon Setting" },
                    { value: "topo", label: "Topographical & Contour Layout" },
                    { value: "architectural", label: "Architectural Design & Supervision" },
                    { value: "gis", label: "Digital Mapping & Geoinformatics" },
                  ]}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Land Size"
                    value={calculatorInputs.size}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, size: event.target.value }))}
                    options={[
                      { value: "1-plot", label: "1 Plot (Approx 600 sqm)" },
                      { value: "1-acre", label: "1 Acre (Approx 6 Plots)" },
                      { value: "5-acres", label: "5 Acres" },
                      { value: "10-acres-plus", label: "10+ Acres" },
                    ]}
                  />
                  <Select
                    label="Terrain Profile"
                    value={calculatorInputs.terrain}
                    onChange={(event) => setCalculatorInputs((current) => ({ ...current, terrain: event.target.value }))}
                    options={[
                      { value: "flat", label: "Flat / Developed" },
                      { value: "hilly", label: "Hilly / Mountainous" },
                      { value: "swampy", label: "Swamp / Waterlogged" },
                    ]}
                  />
                </div>
                <div className="mt-8 space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Project Budget</p>
                  <p className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
                    {formatCurrency(calculatedEstimate.min)} - {formatCurrency(calculatedEstimate.max)}
                  </p>
                  <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Info className="h-3 w-3 shrink-0 text-cyan-500" />
                    Includes standard regulatory registration fees. Subject to physical inspection.
                  </p>
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
                <Select
                  label="Desired Technical Service"
                  value={quoteForm.serviceType}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, serviceType: event.target.value }))}
                  options={services.length > 0
                    ? [...serviceFeeOptions.map((service) => ({ value: service, label: service })), ...services.map((service) => ({ value: service.title, label: service.title }))]
                    : serviceFeeOptions.map((service) => ({ value: service, label: service }))}
                />
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
                      { value: "Dajem Orbital Resources Limited", label: "Dajem Orbital Resources Limited" },
                      { value: "Dajem Homes Limited", label: "Dajem Homes Limited" },
                      { value: "Others", label: "Others" },
                    ]}
                  />
                )}
                <Select
                  label="Existing Survey Plan"
                  value={quoteForm.hasExistingSurveyPlan}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, hasExistingSurveyPlan: event.target.value, uploadedDocuments: [] }))}
                  options={[
                    { value: "no", label: "No - Full Survey" },
                    { value: "yes", label: "Yes - Change of Title" },
                  ]}
                />
              </div>

              {quoteForm.hasExistingSurveyPlan === "yes" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="plan-number">Survey Plan Number</Label>
                    <Input
                      id="plan-number"
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
                <Label htmlFor="q-desc">Project Details & Location Landmark</Label>
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
                <span>I attest that every information submitted is true, accurate, and legally provided. I understand that processing may take 24 hours before payment instructions are issued.</span>
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

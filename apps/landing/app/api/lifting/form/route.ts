import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextRequest } from "next/server";
import { getSnapshot } from "@repo/ui/lib/server/platform-repository";
import { readSessionEmail } from "@repo/ui/lib/server/session";

export const dynamic = "force-dynamic";
const pdfText = (value: string) => value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "?");

export async function GET(request: NextRequest) {
  const email = await readSessionEmail(request);
  if (!email) return new Response("Sign in to download the form.", { status: 401 });

  const applicationNumber = request.nextUrl.searchParams.get("application") ?? "";
  const blank = request.nextUrl.searchParams.get("blank") === "1";
  const snapshot = await getSnapshot(email);
  const survey = blank ? undefined : snapshot.surveys.find((entry) => entry.applicationNumber === applicationNumber && entry.lifting);
  if (!blank && !survey) return new Response("Lifting application not found.", { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.08, 0.14, 0.25);
  const muted = rgb(0.35, 0.4, 0.48);
  let y = 798;

  const text = (value: string, size = 10, weight = regular) => {
    page.drawText(pdfText(value).slice(0, 95), { x: 42, y, size, font: weight, color: dark });
    y -= size + 12;
  };
  const field = (label: string, value = "") => {
    page.drawText(label, { x: 42, y, size: 9, font: bold, color: muted });
    page.drawText(pdfText(value).slice(0, 55), { x: 210, y, size: 10, font: regular, color: dark });
    page.drawLine({ start: { x: 210, y: y - 4 }, end: { x: 552, y: y - 4 }, thickness: 0.5, color: muted });
    y -= 27;
  };

  text("DAJEM ORBITAL RESOURCES LIMITED", 17, bold);
  text("APPLICATION FOR SURVEY PLAN LIFTING / EXTRACTION / CHANGE OF TITLE", 10, bold);
  text(`Application: ${survey?.applicationNumber ?? "________________"}    Date: ${new Date().toLocaleDateString("en-NG")}`, 9);
  y -= 12;
  field("PURCHASER / ALLOTTEE", survey?.userName);
  field("PURCHASER ADDRESS", survey?.lifting?.buyerAddress);
  field("PURCHASER PHONE", survey?.userPhone);
  field("PURCHASER EMAIL", survey?.userEmail);
  field("SELLER / DONOR", survey?.lifting?.sellerName);
  field("SELLER ADDRESS", survey?.lifting?.sellerAddress);
  field("SELLER PHONE", survey?.lifting?.sellerPhone);
  field("PLOT NUMBER", survey?.lifting?.plotNumber);
  field("LAYOUT / ESTATE", survey?.lifting?.estateName);
  field("DOCUMENT SUBMITTED", survey?.lifting?.documentType);
  field("TYPED DECLARATION NAME", survey?.lifting?.declarationName);
  field("DECLARATION RECORDED", survey?.lifting?.declaredAt ? new Date(survey.lifting.declaredAt).toLocaleString("en-NG") : "");
  field("PURCHASER SIGNATURE / DATE");
  y -= 10;
  text("LAND OWNER / ESTATE MANAGEMENT / COMMUNITY AUTHORIZATION", 11, bold);
  field("AUTHORIZING PERSON NAME");
  field("POSITION / DESIGNATION");
  field("ADDRESS");
  field("PHONE / EMAIL");
  field("SIGNATURE / DATE");
  field("REMARKS");
  field("ID CARD TYPE SUBMITTED");
  y -= 6;
  text("OFFICIAL USE ONLY", 10, bold);
  field("PAYMENT CONFIRMED BY");
  field("PLAN NUMBER / CHECKED BY");
  page.drawText("A completed form does not authorize lifting until DAJEM independently verifies identity and landowner approval.", { x: 42, y: 27, size: 7, font: regular, color: muted });

  return new Response(Buffer.from(await pdf.save()), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="dajem-lifting-${survey?.applicationNumber ?? "blank"}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

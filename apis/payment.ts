import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/payment`);

export interface QPayUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface InvoiceResponse {
  invoiceId: string;
  qrImage: string;      // raw base64 — prefix with data:image/png;base64, before use
  qrText: string;
  paymentUrl: string;
  urls: QPayUrl[];
  amount: number;
}

export interface PaymentStatus {
  paid: boolean;
  amount: number;
}

export const createInvoice = (feature: "analyze" | "outfit" | "hairstyle" = "analyze"): Promise<InvoiceResponse> =>
  http.post("/invoice", { feature });

export const checkPayment = (invoiceId: string): Promise<PaymentStatus> =>
  http.get(`/check/${encodeURIComponent(invoiceId)}`);

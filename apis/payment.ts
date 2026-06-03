import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/payment`);

export interface QPayUrl {
  name:        string;
  description: string;
  logo:        string;
  link:        string;
}

export interface InvoiceResponse {
  invoiceId:  string;
  qrImage:    string;   // raw base64 — prefix with data:image/png;base64,
  qrText:     string;
  paymentUrl: string;
  urls:       QPayUrl[];
  amount:     number;
}

export interface PaymentStatus {
  paid:   boolean;
  amount: number;
}

/** Create a Basic or Pro subscription invoice */
export const createSubscriptionInvoice = (plan: "basic" | "pro"): Promise<InvoiceResponse> =>
  http.post("/invoice", { feature: plan });

/** Poll payment status */
export const checkPayment = (invoiceId: string): Promise<PaymentStatus> =>
  http.get(`/check/${encodeURIComponent(invoiceId)}`);

interface ErrorMessage {
  code?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export class HttpHandler {
  statusCode: number;
  code: string | undefined;
  error: string | undefined;
  message: string | undefined;
  payload: Record<string, unknown> | undefined;

  constructor(statusCode: number, errorMessage?: ErrorMessage) {
    const { code, error, message, ...rest } = errorMessage || {};
    this.statusCode = statusCode;
    this.code = code;
    this.error = error;
    this.message = message;
    this.payload = rest;
  }

  async handle(res: Response) {
    let data;

    try {
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }
    } catch {
      throw new HttpHandler(this.statusCode, {
        code: "PARSE_ERROR",
        error: "PARSE_ERROR",
        message: "Холболтыг алдаа гарлаа!",
      });
    }

    switch (this.statusCode) {
      case 200:
      case 304:
        return data;
      default:
        throw new HttpHandler(this.statusCode, data);
    }
  }
}

export default HttpHandler;

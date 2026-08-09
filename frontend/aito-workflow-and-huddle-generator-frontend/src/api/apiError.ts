//Create the API Error Model
//Defines custom API error handling and error models.
/*Defines the standard frontend error object used for HTTP status, Problem Details, and correlation IDs.*/
export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;

  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly problemDetails?: ApiProblemDetails;
  public readonly correlationId?: string;

  public constructor(
    message: string,
    status: number,
    problemDetails?: ApiProblemDetails,
    correlationId?: string,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.problemDetails = problemDetails;
    this.correlationId = correlationId;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
import { Response } from "express";

// Success Response Handler
type SuccessResponse = {
  res: Response;
  code?: number;
  message?: string;
  data?: any;
  custom?: boolean;
};

function sendSuccessResponse({
  res,
  code = 200,
  message = "Operation Successful",
  data = null,
  custom = false,
}: SuccessResponse): Response<any> {
  const response = custom && data ? { ...data } : { success: true, code: code, message, data };

  return res.status(code).json(response);
}

// Error Response Handler
type ErrorResponse = {
  res: Response;
  code: number;
  error?: any;
  type?: any;
  custom?: boolean;
};

function sendErrorResponse({
  res,
  code,
  error = "Operation failed",
  custom = false,
  type,
}: ErrorResponse): Response<any> {
  const response = custom
    ? { success: false, code: code, message: error, type }
    : { success: false, code: code, message: error };

  return res.status(code).json(response);
}

const ResponseHandler = {
  sendSuccessResponse,
  sendErrorResponse,
};

export default ResponseHandler;

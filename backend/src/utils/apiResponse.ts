// backend/src/utils/apiResponse.ts

export class ApiResponse {
  /**
   * Standard Success Response
   */
  static success(
    res: any,
    message: string,
    data: any = null,
    statusCode: number = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Standard Error Response
   */
  static error(
    res: any,
    message: string,
    statusCode: number = 500,
    errors: any = null,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

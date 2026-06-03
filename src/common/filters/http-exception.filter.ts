import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('LỖI GỐC ĐÂY:', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseMessage = this.getFriendlyMessage(exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: responseMessage,
    });
  }

  private getFriendlyMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      if (Array.isArray(response)) return response;
      if (typeof response === 'object' && response && 'message' in response) {
        const message = (response as any).message;
        return Array.isArray(message) ? message : message ?? 'Lỗi không xác định';
      }
      return 'Lỗi không xác định';
    }

    const error = exception as any;
    const code = error?.code;
    const rawMessage = typeof error?.message === 'string' ? error.message : '';

    if (code === 'P2003') {
      if (rawMessage.includes('Payment_groupId_fkey')) {
        return 'Nhóm chi tiêu không tồn tại hoặc groupId không hợp lệ';
      }

      return 'Dữ liệu liên kết không hợp lệ';
    }

    if (code === 'P2022') {
      return 'Dữ liệu trong database chưa đồng bộ với schema Prisma';
    }

    if (code === 'P2025') {
      return 'Không tìm thấy bản ghi phù hợp';
    }

    if (rawMessage) {
      return rawMessage;
    }

    return 'Lỗi hệ thống nội bộ';
  }
}
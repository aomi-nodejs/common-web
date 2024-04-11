import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';
import { ServiceError } from '@aomi/common-exception/exceptions/service.error';
import { ErrorCode } from '@aomi/common-exception/error-code';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    this.logger.error(
      `请求发生异常: url=${request.url} msg=${exception.message} error=${JSON.stringify(exception)}`,
      exception.stack,
    );

    let status,
      describe = exception.message,
      payload;
    if (exception instanceof ServiceError) {
      status = exception.status;
      describe = exception.describe;
      payload = exception.payload;
    } else if (exception instanceof UnauthorizedException) {
      status = ErrorCode.UNAUTHORIZED;
    } else if (exception instanceof HttpException) {
      super.catch(exception, host);
      return;
    } else {
      status = ErrorCode.EXCEPTION;
    }

    response.status(HttpStatus.OK).json({
      status,
      describe,
      payload,
    });
  }
}

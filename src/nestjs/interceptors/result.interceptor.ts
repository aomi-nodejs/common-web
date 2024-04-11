import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ErrorCode } from '@aomi/common-exception/error-code';

/**
 * 响应结果拦截器
 * 统一返回标准格式报文
 */
@Injectable()
export class ResultInterceptor implements NestInterceptor {
  constructor(private readonly callback?: (req: Request) => void) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const req = context.switchToHttp().getRequest();
        this.callback?.(req);

        return {
          status: ErrorCode.SUCCESS,
          payload: data,
        };
      }),
    );
  }
}

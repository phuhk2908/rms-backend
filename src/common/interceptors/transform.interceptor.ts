import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Định nghĩa cấu trúc response trả về
export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        // Lấy status code từ response http
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // next.handle() trả về một Observable, chúng ta dùng pipe và map để biến đổi dữ liệu
        return next.handle().pipe(
            map(data => {
                // 'data' ở đây là dữ liệu được trả về từ Route Handler (ví dụ: trong controller)
                // Ta sẽ bọc 'data' này vào cấu trúc response chuẩn của chúng ta

                // Logic linh hoạt:
                // - Nếu controller trả về một object có chứa sẵn 'message' và 'result',
                //   chúng ta sẽ sử dụng chúng.
                // - Nếu không, chúng ta sẽ dùng message mặc định và coi toàn bộ 'data' là kết quả.
                return {
                    statusCode,
                    message: data?.message || 'Thao tác thành công',
                    data: data?.result !== undefined ? data.result : data,
                };
            }),
        );
    }
}

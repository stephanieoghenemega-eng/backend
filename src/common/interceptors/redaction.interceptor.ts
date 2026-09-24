import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const SENSITIVE_FIELDS = ['password', 'qrSecret', 'privateKey', 'apiKey', 'token', 'secret'];

@Injectable()
export class RedactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RedactionInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const redactedBody = this.redactSensitiveData(request.body);
    this.logger.log(`[${request.method}] ${request.path} - Body: ${JSON.stringify(redactedBody)}`);
    return next.handle().pipe(tap((data) => {
      const redactedResponse = this.redactSensitiveData(data);
      this.logger.log(`Response: ${JSON.stringify(redactedResponse)}`);
    }));
  }

  private redactSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const redacted = Array.isArray(data) ? [...data] : { ...data };
    for (const key in redacted) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactSensitiveData(redacted[key]);
      }
    }
    return redacted;
  }
}

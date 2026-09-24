import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuid();
    const userId = req.user?.id || 'anonymous';
    req['requestContext'] = { requestId, userId, timestamp: new Date().toISOString() };
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}

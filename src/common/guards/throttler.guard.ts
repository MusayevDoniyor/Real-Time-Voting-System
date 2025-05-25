import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(WsThrottlerGuard.name);

  protected async handleRequest(requestProps: any): Promise<boolean> {
    const { context, limit, ttl } = requestProps;
    const { req, res } = this.getRequestResponse(context);
    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker, this.getContextKey(context));

    this.logger.log(`Checking limits for IP: ${tracker}`);

    try {
      const { totalHits, timeToExpire, isBlocked } =
        await this.storageService.increment(key, ttl, limit, 0, 'default');

      this.logger.log(
        `Current hits: ${totalHits}/${limit}, Expires in: ${timeToExpire}s`,
      );

      if (isBlocked || totalHits > limit) {
        this.logger.warn(`Rate limit exceeded for IP: ${tracker}`);
        throw this.throwThrottlingException(context, {
          limit,
          ttl,
          key,
          tracker,
          totalHits,
          timeToExpire,
          isBlocked,
          timeToBlockExpire: 0,
        });
      }

      if (res?.header && context.getType() !== 'ws') {
        res.header('X-RateLimit-Limit', limit.toString());
        res.header(
          'X-RateLimit-Remaining',
          Math.max(0, limit - totalHits).toString(),
        );
        res.header(
          'X-RateLimit-Reset',
          new Date(Date.now() + timeToExpire * 1000).toISOString(),
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Redis error: ${error.message}`);
      throw new Error('Rate limiting service unavailable');
    }
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip =
      req?.ip ||
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.connection?.remoteAddress ||
      '127.0.0.1';
    if (!ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) && ip !== '127.0.0.1') {
      this.logger.warn(`Invalid IP detected: ${ip}, falling back to 127.0.0.1`);
      return '127.0.0.1';
    }
    return ip;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    props: any,
  ): Promise<void> {
    const errorMessage = `Rate limit exceeded: ${props.totalHits}/${props.limit} requests, resets in ${props.timeToExpire}s`;
    if (context.getType() === ('graphql' as any)) {
      throw new Error(errorMessage);
    }
    if (context.getType() === ('ws' as any)) {
      throw new Error(`WebSocket rate limit exceeded: ${errorMessage}`);
    }
    await super.throwThrottlingException(context, props);
  }

  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();

    const mockRes = {
      header: () => mockRes,
      getHeader: () => undefined,
      setHeader: () => mockRes,
    };

    const ip =
      ctx?.connection?.context?.ip ||
      ctx?.req?.ip ||
      ctx?.req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      ctx?.req?.connection?.remoteAddress ||
      '127.0.0.1';

    const headers =
      ctx?.req?.headers || ctx?.connection?.context?.headers || {};

    return {
      req: { ip, headers },
      res: ctx?.res || mockRes,
    };
  }

  protected getContextKey(context: ExecutionContext): string {
    return context.getClass().name + ':' + context.getHandler().name;
  }
}

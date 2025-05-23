import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async create(key: string, value: any, expireSeconds?: number): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (expireSeconds) {
      await this.redisClient.set(key, stringValue, 'EX', expireSeconds);
    } else {
      await this.redisClient.set(key, stringValue);
    }

    this.logger.log(`Key "${key}" created/updated in Redis`);
  }

  async read<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.log(`Failed to parse Redis value for key "${key}"`);
      return null;
    }
  }

  async update(key: string, value: any, expireSeconds?: number): Promise<void> {
    const exists = await this.redisClient.exists(key);
    if (!exists) {
      this.logger.warn(`Key "${key}" not found for update`);
      throw new Error(`Key "${key}" does not exist`);
    }
    await this.create(key, value, expireSeconds);
    this.logger.log(`Key "${key}" updated in Redis`);
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key);
    this.logger.log(`Key "${key}" deleted from Redis`);
    return result > 0;
  }
}

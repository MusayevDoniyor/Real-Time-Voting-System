import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        try {
          console.log('🔄 Redis serverga ulanish jarayoni boshlanmoqda...');

          const redisUrl = configService.get<string>('REDIS_URL');
          if (!redisUrl) {
            console.error(
              "❌ REDIS_URL aniqlanmadi! Iltimos, .env faylga Redis URL ni qo'shing.",
            );
            throw new Error('REDIS_URL not defined');
          }

          const redisClient = new Redis(redisUrl);

          redisClient.on('connect', () =>
            console.log('🚀 Redis serverga muvaffaqiyatli ulandi!'),
          );
          redisClient.on('error', (err) =>
            console.error('❌ Redis xatolik yuz berdi:', err),
          );

          return redisClient;
        } catch (error) {
          console.error('❌ Redis ulanishida xatolik yuz berdi:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}

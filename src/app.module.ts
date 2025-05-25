import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { AuthModule } from './auth/auth.module';
import { PollModule } from './pool/poll.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { VoteModule } from './vote/vote.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { WsThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'example.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        console.log("🔄 Ma'lumotlar bazasiga ulanish jarayoni boshlandi...");

        const dbConfig: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          synchronize: process.env.NODE_ENV !== 'production',
        };

        try {
          console.log(
            "✅ Ma'lumotlar bazasi konfiguratsiyasi yuklandi:",
            dbConfig,
          );
          console.log('🚀 Ulash muvaffaqiyatli yakunlandi!');
          return dbConfig;
        } catch (error) {
          console.error('❌ Ulashda xatolik yuz berdi:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      graphiql: true,
      autoSchemaFile: join(process.cwd(), '/src/graphql/schema.gql'),
      sortSchema: true,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
      },
      // context: ({ req, connection }) => {
      //   const ip =
      //     connection?.context?.ip ||
      //     req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      //     req?.connection?.remoteAddress ||
      //     '127.0.0.1';
      //   return {
      //     req: {
      //       ...req,
      //       ip,
      //       headers: req?.headers || connection?.context?.headers || {},
      //     },
      //     connection,
      //   };
      // },
    }),
    RedisModule,
    AuthModule,
    PollModule,
    VoteModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        try {
          const redisUrl = new URL(
            configService.get<string>('REDIS_URL') as string,
          );
          return {
            throttlers: [{ ttl: 60000, limit: 5 }],
            storage: new ThrottlerStorageRedisService({
              host: redisUrl.hostname,
              port: parseInt(redisUrl.port),
              password: redisUrl.password || undefined,
              db: 0,
            }),
          };
        } catch (error) {
          console.error('❌ Invalid REDIS_URL:', error);
          throw new Error('Failed to configure Redis for throttling');
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: WsThrottlerGuard,
    },
  ],
  exports: [RedisService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollResolver } from './poll.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll])],
  providers: [PollResolver, PollService],
})
export class PollModule {}

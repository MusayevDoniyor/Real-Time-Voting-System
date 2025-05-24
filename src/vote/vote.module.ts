import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteResolver } from './vote.resolver';
import { Poll } from 'src/pool/entities/poll.entity';
import { Vote } from './entities/vote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Poll])],
  providers: [VoteResolver, VoteService],
})
export class VoteModule {}

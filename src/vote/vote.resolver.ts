import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Subscription,
} from '@nestjs/graphql';
import { VoteService } from './vote.service';
import { Vote } from './entities/vote.entity';
import { CreateVoteInput } from './dto/create-vote.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Resolver(() => Vote)
@UseGuards(GqlAuthGuard)
export class VoteResolver {
  constructor(private readonly voteService: VoteService) {}

  @Mutation(() => Vote)
  createVote(
    @Args('createVoteInput') createVoteInput: CreateVoteInput,
    @CurrentUser() user: User,
  ) {
    return this.voteService.createVote(createVoteInput, user);
  }

  @Query(() => [Vote])
  getVotes(@Args('pollId') pollId: string) {
    return this.voteService.getVotes(pollId);
  }

  @Subscription(() => Vote, {
    filter: (payload, variables) =>
      payload.voteUpdated.poll.id === variables.pollId,
    resolve: (value) => value.voteUpdated,
  })
  findOne(@Args('pollId', { type: () => String }) pollId: string) {
    return this.voteService
      .getPubSub()
      .asyncIterableIterator(`voteUpdated:${pollId}`);
  }
}

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PollService } from './poll.service';
import { Poll } from './entities/poll.entity';
import { CreatePollInput } from './dto/create-poll.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { PollResponse, PollResultsResponse } from './dto/poll.response';
import { UpdatePollInput } from './dto/update-poll.input';

@Resolver(() => Poll)
@UseGuards(GqlAuthGuard, RolesGuard)
export class PollResolver {
  constructor(private readonly pollService: PollService) {}

  @Mutation(() => PollResponse)
  @Roles('admin')
  createPool(
    @Args('createPollInput') createPollInput: CreatePollInput,
    @CurrentUser() user: User,
  ) {
    return this.pollService.createPoll(createPollInput, user);
  }

  @Mutation(() => PollResponse)
  @Roles('admin')
  updatePool(@Args('updatePollInput') updatePollInput: UpdatePollInput) {
    return this.pollService.updatePoll(updatePollInput.id, updatePollInput);
  }

  @Roles('admin')
  @Query(() => [Poll], { name: 'activePolls' })
  getActivePolls() {
    return this.pollService.findActivePools();
  }

  @Roles('admin')
  @Query(() => Poll, { name: 'pool' })
  getPool(@Args('id', { type: () => String }) id: string) {
    return this.pollService.findOne(id);
  }

  @Roles('admin')
  @Query(() => PollResultsResponse, { name: 'pollResults' })
  getPollResults(@Args('id') id: string) {
    return this.pollService.getResults(id);
  }

  @Roles('admin')
  @Mutation(() => PollResponse)
  toggleActive(@Args('id') id: string) {
    return this.pollService.toggleActive(id);
  }

  @Roles('admin')
  @Mutation(() => PollResponse)
  removePool(@Args('id', { type: () => String }) id: string) {
    return this.pollService.remove(id);
  }
}

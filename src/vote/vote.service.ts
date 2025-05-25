import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoteInput } from './dto/create-vote.input';
import { PubSub } from 'graphql-subscriptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { Repository } from 'typeorm';
import { Poll } from 'src/pool/entities/poll.entity';
import { User } from 'src/auth/entities/user.entity';

const pubSub = new PubSub();

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepo: Repository<Vote>,
    @InjectRepository(Poll)
    private pollRepo: Repository<Poll>,
  ) {}

  async createVote(
    createVoteInput: CreateVoteInput,
    user: User,
  ): Promise<Vote> {
    const poll = await this.pollRepo.findOne({
      where: { id: createVoteInput.pollId },
      relations: ['votes'],
    });

    if (!poll) throw new NotFoundException('Poll not found');
    if (!poll.is_active) throw new ConflictException('Poll is not active');

    const existingVote = await this.voteRepo.findOne({
      where: { poll: { id: poll.id }, user: { id: user.id } },
    });
    if (existingVote) throw new ConflictException('User already voted');

    const res = poll.options.map((p) => p.toLowerCase());

    if (!res.includes(createVoteInput.selectedOption.toLowerCase())) {
      throw new ConflictException(
        `Invalid option selected. Select from ${poll.options.join(', ')}`,
      );
    }

    const vote = this.voteRepo.create({
      poll,
      user,
      selectedOption: createVoteInput.selectedOption,
    });

    await this.voteRepo.save(vote);
    pubSub.publish(`voteUpdated:${poll.id}`, { voteUpdated: vote });

    return vote;
  }

  async getVotes(pollId: string) {
    return this.voteRepo.find({
      where: { poll: { id: pollId } },
      relations: ['user', 'poll'],
    });
  }

  getPubSub() {
    return pubSub;
  }
}

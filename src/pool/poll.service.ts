import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePollInput } from './dto/create-poll.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PollResponse } from './dto/poll.response';
import { UpdatePollInput } from './dto/update-poll.input';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private pollRepo: Repository<Poll>,
  ) {}

  async findActivePools() {
    return this.pollRepo.find({
      where: { is_active: true },
      relations: ['created_by', 'votes'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const poll = await this.pollRepo.findOne({
      where: { id },
      relations: ['votes', 'created_by'],
    });

    if (!poll) throw new NotFoundException('Poll not found');

    return poll;
  }

  async createPoll(
    createPollInput: CreatePollInput,
    user: User,
  ): Promise<PollResponse> {
    const poll = this.pollRepo.create({
      ...createPollInput,
      created_by: user,
    });

    await this.pollRepo.save(poll);

    return {
      poll,
      message: 'Poll created successfully',
    };
  }

  async updatePoll(
    id: string,
    updateData: Partial<UpdatePollInput>,
  ): Promise<PollResponse> {
    const poll = await this.pollRepo.findOne({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');

    Object.assign(poll, updateData);

    await this.pollRepo.save(poll);

    return {
      message: 'Poll updated successfully',
      poll,
    };
  }

  async getResults(id: string) {
    const poll = await this.pollRepo.findOne({
      where: { id },
      relations: ['votes'],
    });

    if (!poll) throw new NotFoundException('Poll not found');

    const votesCount = poll.votes.reduce(
      (acc, v) => {
        const optionKey = v.selectedOption.toLowerCase();
        acc[optionKey] = (acc[optionKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const results = poll.options.map((option) => {
      return {
        option,
        votes: votesCount[option.toLowerCase()] || 0,
        votes_percentage: `${(poll.votes.length > 0
          ? ((votesCount[option.toLowerCase()] || 0) / poll.votes.length) * 100
          : 0
        ).toFixed(2)}%`,
      };
    });

    return {
      question: poll.question,
      totalVotes: poll.votes.length,
      results,
    };
  }

  async toggleActive(id: string): Promise<PollResponse> {
    const poll = await this.pollRepo.findOne({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');

    poll.is_active = !poll.is_active;
    await this.pollRepo.save(poll);

    return {
      message: `Poll ${poll.is_active ? 'activated' : 'deactivated'} successfully`,
      poll,
    };
  }

  async remove(id: string): Promise<PollResponse> {
    const poll = await this.pollRepo.findOne({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');

    await this.pollRepo.remove(poll);

    return { message: 'Poll deleted successfully' };
  }
}

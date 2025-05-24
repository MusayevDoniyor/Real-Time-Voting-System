import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePollInput } from './dto/create-poll.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PollResponse } from './dto/poll.response';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private pollRepo: Repository<Poll>,
  ) {}

  async findActivePools() {
    return this.pollRepo.find({
      where: { is_active: true },
      relations: ['created_by'],
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

  async getResults(id: string) {
    const poll = await this.pollRepo.findOne({
      where: { id },
      relations: ['votes'],
    });

    if (!poll) throw new NotFoundException('Poll not found');

    const results = poll.options.map((option) => ({
      option,
      votes: poll.votes.filter((v) => v.selectedOption === option).length,
    }));

    return {
      question: poll.question,
      totalVotes: poll.votes.length,
      results,
    };
  }

  async toggleActive(id: string) {
    const poll = await this.pollRepo.findOne({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');

    poll.is_active = !poll.is_active;

    return this.pollRepo.save(poll);
  }

  async remove(id: string): Promise<PollResponse> {
    const poll = await this.pollRepo.findOne({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');

    await this.pollRepo.remove(poll);

    return { message: 'Poll deleted successfully' };
  }
}

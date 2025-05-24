import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Poll } from '../entities/poll.entity';

@ObjectType()
export class PollResponse {
  @Field(() => Poll)
  poll?: Poll;

  @Field(() => String)
  message: string;
}

@ObjectType()
class PollResult {
  @Field()
  option: string;

  @Field(() => Int)
  votes: number;

  @Field()
  votes_percentage: string;
}

@ObjectType()
export class PollResultsResponse {
  @Field()
  question: string;

  @Field(() => Int)
  totalVotes: number;

  @Field(() => [PollResult])
  results: PollResult[];
}

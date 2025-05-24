import { Field, ObjectType } from '@nestjs/graphql';
import { Poll } from '../entities/poll.entity';

@ObjectType()
export class PollResponse {
  @Field(() => Poll)
  poll?: Poll;

  @Field(() => String)
  message: string;
}

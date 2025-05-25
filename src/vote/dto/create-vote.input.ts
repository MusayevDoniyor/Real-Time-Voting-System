import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateVoteInput {
  @Field()
  pollId: string;

  @Field()
  selectedOption: string;
}

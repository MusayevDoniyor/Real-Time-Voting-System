import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreatePollInput } from './create-poll.input';

@InputType()
export class UpdatePollInput extends PartialType(CreatePollInput) {
  @Field(() => String, { description: 'Poll ID' })
  id: string;
}

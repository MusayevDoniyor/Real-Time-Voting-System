import { InputType, Field } from '@nestjs/graphql';
import { IsArray, IsString, MinLength } from 'class-validator';

@InputType()
export class CreatePollInput {
  @Field(() => String, { description: 'Poll question' })
  @IsString()
  @MinLength(5)
  question: string;

  @Field(() => [String], { description: 'Poll options' })
  @IsArray()
  @MinLength(2, { each: true })
  options: string[];
}

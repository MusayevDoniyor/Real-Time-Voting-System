import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = 'PUB_SUB';

export const PubSubProvider = {
  provider: PUB_SUB,
  useValue: new PubSub(),
};

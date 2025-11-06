import { CategoryType } from './category';
import { TransactionProps } from './transaction';

export type RoomType = {
  id: string;
  name: string;
  members: Record<
    string,
    {
      joineredAt: Date;
      role: string;
    }
  >;
  description: string;
  transactions?: TransactionProps[];
  categories: CategoryType[];
};

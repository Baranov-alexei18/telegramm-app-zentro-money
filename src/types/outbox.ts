import { TransactionProps } from './transaction';

export enum OutboxOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export type OutboxEntryType = {
  transactionId: string;
  roomId: string;
  op: OutboxOperation;
  payload?: TransactionProps;
  updatedAt: number;
};

export type IncomingOutboxMutationType =
  | {
      op: OutboxOperation.CREATE | OutboxOperation.UPDATE;
      roomId: string;
      transactionId: string;
      payload: TransactionProps;
      updatedAt?: number;
    }
  | {
      op: OutboxOperation.DELETE;
      roomId: string;
      transactionId: string;
      updatedAt?: number;
    };

export type OutboxStoragePortType = {
  getById: (transactionId: string) => Promise<OutboxEntryType | null>;
  getAll: () => Promise<OutboxEntryType[]>;
  getByRoom: (roomId: string) => Promise<OutboxEntryType[]>;
  put: (entry: OutboxEntryType) => Promise<void>;
  remove: (transactionId: string) => Promise<void>;
};

export type RemoteTransactionGatewayType = {
  create: (roomId: string, transaction: TransactionProps) => Promise<void>;
  update: (roomId: string, transaction: TransactionProps) => Promise<void>;
  remove: (roomId: string, transactionId: string) => Promise<void>;
};

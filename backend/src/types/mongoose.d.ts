import 'mongoose';

declare module 'mongoose' {
  interface Document {
    createdAt?: Date;
    updatedAt?: Date;
  }
}

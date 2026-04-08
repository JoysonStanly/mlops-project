declare module 'bcryptjs' {
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
  export function hash(data: string | Buffer, salt: string | number): Promise<string>;
  export function hashSync(data: string | Buffer, salt: string | number): string;
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  export function compareSync(data: string | Buffer, encrypted: string): boolean;
  export const getRounds: (hash: string) => number;
  export const truncates: (data: string | Buffer) => boolean;
}

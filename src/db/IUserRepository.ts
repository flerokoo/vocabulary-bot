import { IUser } from "../entities/IUser";

export interface IUserRepository {
  getOrAdd(telegramId: string): Promise<IUser>;
}

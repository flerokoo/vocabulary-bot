import { ICard } from "../entities/ICard";

export interface ICardExporter {
  (cards : ICard[]) : Promise<{ data: string, filename: string }>;
}
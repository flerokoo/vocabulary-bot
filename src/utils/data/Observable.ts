export interface Subscription {
  unsubscribe: () => void;
}

export abstract class Observable<TEvent> {
  private readonly observers: Set<(value: TEvent) => void> = new Set<
    (value: TEvent) => void
  >();

  public subscribe(callback: (x: TEvent) => void): Subscription {
    this.observers.add(callback);
    const unsubscribe = () => this.observers.delete(callback);
    return { unsubscribe };
  }

  protected emit(value: TEvent): void {
    for (const observer of this.observers.values()) {
      observer(value);
    }
  }
}

export class AsyncQueue {
  private running = false;
  private tasks: (() => Promise<void>)[] = [];

  add(task: () => Promise<void>) {
    this.tasks.push(task);
    if (!this.running) this.tryStartNext();
  }

  private onComplete() {
    this.tryStartNext();
  }

  private tryStartNext() {
    if (this.tasks.length === 0) return;
    const task = this.tasks.shift();
    this.running = true;
    task!().then(() => {
      this.running = false;
      this.onComplete();
    });
  }

  clear() {
    this.tasks = [];
  }
}
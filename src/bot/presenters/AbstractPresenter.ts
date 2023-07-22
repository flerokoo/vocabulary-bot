export class AbstractPresenter<TView> {
  private viewRef!: TView;

  constructor() {}

  attachView(view: TView) {
    this.viewRef = view;
  }

  protected get view() {
    return this.viewRef;
  }
}

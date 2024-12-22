export class CannotUsePointError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export class PointValidateError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

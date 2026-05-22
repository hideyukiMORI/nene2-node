export class JsonBodyParseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonBodyParseException';
  }
}

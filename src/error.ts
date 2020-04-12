export class HttpError extends Error {
  statusCode: number

  constructor (message: string, httpStatus: number) {
    super(message)
    this.statusCode = httpStatus
  }
}
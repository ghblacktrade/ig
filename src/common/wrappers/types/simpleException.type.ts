import { HttpException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash';

export class SimpleException extends HttpException {
  constructor(
    message: string | SimpleException,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(_.isString(message) ? message : message.message, status);
  }
}

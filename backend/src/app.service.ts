import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'saccentre-api',
      status: 'ok',
    } as const;
  }
}

import { Injectable } from '@nestjs/common';
import { MOCK_ALERTS } from '../mock/mock-data';

@Injectable()
export class AlertsService {
  private alerts = JSON.parse(JSON.stringify(MOCK_ALERTS));

  getAll() { return this.alerts; }

  markRead(id: number, userId: string) {
    const alert = this.alerts.find((a: any) => a.id === id);
    if (alert && !alert.read_by.includes(userId)) {
      alert.read_by.push(userId);
    }
    return alert;
  }
}

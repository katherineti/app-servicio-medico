import { Injectable } from '@angular/core';
import moment, { MomentInput } from 'moment-timezone';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Injectable({
  providedIn: 'root', 
})
export class DateFormatService {
  constructor() { }

  getDateFormats() {
    return MY_DATE_FORMATS;
  }

  convertUtcToVenezuelaWithMoment(fechaUtc: MomentInput): string {
    const timeZone = 'America/Caracas';
    const fechaLocalVenezuela = moment.utc(fechaUtc).tz(timeZone);
    return fechaLocalVenezuela.format('YYYY-MM-DD HH:mm:ss ZZ');
    // return fechaLocalVenezuela.format('YYYY-MM-DD HH:mm:ss zzzz');
  }
}
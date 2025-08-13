import { Pipe, PipeTransform, inject } from '@angular/core';
import { DateUtilsService } from '../servicos/date-utils.service';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private readonly dateUtils = inject(DateUtilsService);

  transform(
    value: string | null | undefined, 
    format: 'date' | 'datetime' | 'full' | 'relative' | 'input-date' | 'input-datetime' = 'date'
  ): string {
    if (!value) return '-';

    switch (format) {
      case 'date':
        return this.dateUtils.formatToBrazilianDate(value);
      case 'datetime':
        return this.dateUtils.formatToBrazilianDateTime(value);
      case 'full':
        return this.dateUtils.formatToBrazilianDateTimeFull(value);
      case 'relative':
        return this.dateUtils.formatToRelativeTime(value);
      case 'input-date':
        return this.dateUtils.formatForDateInput(value);
      case 'input-datetime':
        return this.dateUtils.formatForDateTimeInput(value);
      default:
        return this.dateUtils.formatToBrazilianDate(value);
    }
  }
}

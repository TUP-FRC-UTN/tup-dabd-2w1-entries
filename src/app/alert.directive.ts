import { Directive, Input, ElementRef, Renderer2, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appAlert]',
  standalone: true
})
export class AlertDirective {
  @Input() appAlertMessage: string = '';
  @Output() confirmed = new EventEmitter<void>();
  constructor(private el: ElementRef, private renderer: Renderer2) { }
  @HostListener('change', ['$event']) onChange(event: Event) {
    const confirmed = confirm(this.appAlertMessage || '¿Está seguro?');
    if (confirmed) {
      this.executeAction();
    } else {
      // Reiniciar el valor del select si se cancela
      const select = event.target as HTMLSelectElement;
      select.value = '';
    }
  }
  private executeAction() {
    this.confirmed.emit();
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lazy1Component } from './lazy-1.component';

@NgModule({
  declarations: [Lazy1Component],
  imports: [CommonModule],
})
export class Lazy1Module {
  static rootComponent = Lazy1Component;
}

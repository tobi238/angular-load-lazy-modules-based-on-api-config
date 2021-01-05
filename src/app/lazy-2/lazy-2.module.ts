import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lazy2Component } from './lazy-2.component';

@NgModule({
  declarations: [Lazy2Component],
  imports: [CommonModule],
})
export class Lazy2Module {
  static rootComponent = Lazy2Component;
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyMapComponent } from './lazy-map.component';

@NgModule({
  declarations: [LazyMapComponent],
  imports: [CommonModule],
})
export class LazyMapModule {
  static rootComponent = LazyMapComponent;
}

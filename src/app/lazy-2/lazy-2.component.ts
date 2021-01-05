import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-lazy-component',
  template: `
    <p>I am a lazy image component from lazy2 module.</p>
    <img [src]="data.imgUrl" />
  `,
})
export class Lazy2Component implements OnInit {
  @Input() data: any;

  constructor() {}
  ngOnInit() {}
}

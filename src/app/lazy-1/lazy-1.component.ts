import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-lazy-1-component',
  template: `
    <p>I am a lazy link component from lazy1 module.</p>
    <a [href]="data.linkUrl" target="_blank">{{ data.linkText }}</a>
  `,
})
export class Lazy1Component implements OnInit {
  @Input() data: any;

  constructor() {}
  ngOnInit() {}
}

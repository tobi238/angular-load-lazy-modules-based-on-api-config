import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LazyLoaderService } from './lazy-loader.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  isLoading = false;

  @ViewChild('dynamicComponents', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  constructor(private lazyService: LazyLoaderService) {}

  ngOnInit(): void {
    this.loadConfig().subscribe((config) => {
      this.renderComponents(config);
    });
  }

  renderComponents(config: any) {
    this.lazyService.loadAndRenderComponents(config, this.container);
  }

  loadConfig(): Observable<any> {
    const data = {
      components: [
        {
          type: 'lazy1',
          data: {
            linkUrl: 'https://google.de',
            linkText: 'Number 1',
          },
        },
        {
          type: 'lazy2',
          data: {
            imgUrl: 'https://picsum.photos/200',
          },
        },
      ],
    };

    return of(data).pipe(delay(3000));
  }
}

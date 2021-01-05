import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { LazyLoaderService } from './lazy-loader.service';
import { LazyMapComponent } from './lazy-map/lazy-map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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

  async renderComponents(config: any) {
    await this.lazyService.loadAndRenderComponents(config, this.container);
    const mapRef = this.lazyService.getComponentRef<LazyMapComponent>('map');

    // if a map has been configured, the map component reference is defined
    if (mapRef) {
      mapRef.instance.mapReady$
        .pipe(takeUntil(mapRef.instance.destroy$)) // unsubscribe if lazy map component is destroyed
        .subscribe(() => {
          console.log('map is ready');
          setTimeout(() => {
            mapRef.instance.view.animate({ zoom: 5 });
          }, 3000);
        });
    }
  }

  // load a config object from an api, defining all components and their config data to be lazy loaded
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
        {
          type: 'map',
          data: { center: [960512.74, 6276359.13], zoom: 8.5 },
        },
      ],
    };

    return of(data).pipe(delay(3000));
  }
}

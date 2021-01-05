import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import { View, Map } from 'ol';
import { Extent } from 'ol/extent';
import Projection from 'ol/proj/Projection';
import { get as GetProjection } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { ScaleLine, defaults as DefaultControls } from 'ol/control';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-map-component',
  template: `<div id="map" class="map-container"></div>`,
  styleUrls: ['./lazy-map.component.scss'],
})
export class LazyMapComponent implements AfterViewInit, OnDestroy {
  @Input() data: any;

  /**
   * Output event emitted when the map has been created.
   */
  @Output() mapReady$ = new EventEmitter<void>();

  /**
   * Map instance.
   */
  map!: Map;

  /**
   * Map View reference
   */
  view!: View;

  /**
   * Map Projection
   */
  projection!: Projection;

  /**
   * Initial Map Extent
   */
  extent: Extent = [-20026376.39, -20048966.1, 20026376.39, 20048966.1];

  /**
   * Track if lazy map component is destroyed.
   */
  destroy$ = new Subject();

  constructor(private zone: NgZone, private cd: ChangeDetectorRef) {
    window['map'] = this;
  }

  ngAfterViewInit(): void {
    if (!this.map) {
      this.zone.runOutsideAngular(() => {
        this.initView();
        this.initMap();
      });
    }
    setTimeout(() => this.mapReady$.emit());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initView() {
    this.projection = GetProjection('EPSG:3857');
    this.projection.setExtent(this.extent);

    this.view = new View({
      center: this.data.center,
      zoom: this.data.zoom,
      projection: this.projection,
    });
  }

  private initMap(): void {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM({}),
        }),
      ],
      target: 'map',
      view: this.view,
      controls: DefaultControls().extend([new ScaleLine({})]),
    });
  }
}

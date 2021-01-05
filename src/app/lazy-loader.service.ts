import {
  Compiler,
  ComponentRef,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModuleFactory,
  Type,
  ViewContainerRef,
} from '@angular/core';

export type LazyModules = Map<
  string,
  { load: () => Promise<NgModuleFactory<any> | Type<any>> }
>;

export const lazyModules: LazyModules = new Map([
  [
    'lazy1',
    { load: () => import('./lazy-1/lazy-1.module').then((m) => m.Lazy1Module) },
  ],
  [
    'lazy2',
    { load: () => import('./lazy-2/lazy-2.module').then((m) => m.Lazy2Module) },
  ],
  [
    'map',
    {
      load: () =>
        import('./lazy-map/lazy-map.module').then((m) => m.LazyMapModule),
    },
  ],
]);

export const LAZY_MODULES_MAP = new InjectionToken<LazyModules>(
  'LAZY_MODULES_MAP',
  {
    factory: () => lazyModules,
  }
);

export type ModuleWithRoot = Type<any> & { rootComponent: Type<any> };

export interface DynamicComponentInstance {
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class LazyLoaderService {
  componentRefs = new Map();

  constructor(
    private injector: Injector,
    private compiler: Compiler,
    @Inject(LAZY_MODULES_MAP) private modulesMap: LazyModules
  ) {}

  async loadAndRenderComponents(data: any, container: ViewContainerRef) {
    container.clear();

    for await (const { type, data: componentData } of data.components) {
      const found = this.modulesMap.has(type);
      if (!found) {
        throw new Error(`could not find module of type '${type}'`);
      }
      let moduleOrFactory = await this.modulesMap.get(type).load();
      let moduleFactory;
      if (moduleOrFactory instanceof NgModuleFactory) {
        moduleFactory = moduleOrFactory; // AOT
      } else {
        moduleFactory = await this.compiler.compileModuleAsync(moduleOrFactory); //JIT
      }
      const moduleRef = moduleFactory.create(this.injector);
      const rootComponent = (moduleFactory.moduleType as ModuleWithRoot)
        .rootComponent;
      const factory = moduleRef.componentFactoryResolver.resolveComponentFactory(
        rootComponent
      );
      const componentRef = container.createComponent(factory);

      // pass config data to component
      (componentRef.instance as DynamicComponentInstance).data = componentData;
      this.componentRefs.set(type, componentRef);
    }
    return this.componentRefs;
  }

  getComponentRef<T>(module: string): ComponentRef<T> | undefined {
    return this.componentRefs.get(module);
  }
}

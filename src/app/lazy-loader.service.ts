import {
  Compiler,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModuleFactory,
  Type,
  ViewContainerRef,
} from '@angular/core';

export interface LazyModules {
  [key: string]: {
    loadChildren: () => Promise<NgModuleFactory<any> | Type<any>>;
  };
}

export const lazyMap: LazyModules = {
  lazy1: {
    loadChildren: () =>
      import('./lazy-1/lazy.module').then((m) => m.LazyModule),
  },
  lazy2: {
    loadChildren: () =>
      import('./lazy-2/lazy-2.module').then((m) => m.Lazy2Module),
  },
};

export const LAZY_MODULES_MAP = new InjectionToken('LAZY_MODULES_MAP', {
  factory: () => lazyMap,
});

export type ModuleWithRoot = Type<any> & { rootComponent: Type<any> };

export interface DynamicComponentInstance {
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class LazyLoaderService {
  constructor(
    private injector: Injector,
    private compiler: Compiler,
    @Inject(LAZY_MODULES_MAP) private modulesMap: LazyModules
  ) {}

  async loadAndRenderComponents(data: any, container: ViewContainerRef) {
    container.clear();

    for await (const { type, data: componentData } of data.components) {
      const mod = this.modulesMap[type];
      if (!mod) {
        throw new Error(`could not find module of type '${type}'`);
      }
      let moduleOrFactory = await mod.loadChildren();
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
    }
  }
}

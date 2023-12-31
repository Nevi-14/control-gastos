import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InicioPage } from './inicio.page';
import { MisGastosPageModule } from '../mis-gastos/mis-gastos.module';

const routes: Routes = [
  {
    path: '',
    component: InicioPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'mis-gastos',
      },
      {
        path: 'mis-gastos',
        loadChildren: () => import('../mis-gastos/mis-gastos.module').then((m) => m.MisGastosPageModule),
      },
      {
        path: 'liquidaciones',
        loadChildren: () => import('../liquidaciones/liquidaciones.module').then((m) => m.LiquidacionesPageModule),
      },
      {
        path: 'sobrantes',
        loadChildren: () => import('../sobrantes/sobrantes.module').then((m) => m.SobrantesPageModule),
      },
      {
        path: 'devoluciones',
        loadChildren: () => import('../devoluciones/devoluciones.module').then((m) => m.DevolucionesPageModule),
      },
      
      {
        path: 'historial',
        loadChildren: () => import('../historial/historial.module').then((m) => m.HistorialPageModule),
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioPageRoutingModule {}

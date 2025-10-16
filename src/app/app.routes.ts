import { Routes } from '@angular/router';
import { AcopiadoresComponent } from './components/acopiadores/acopiadores.component';

export const routes: Routes = [
  { path: '', redirectTo: '/acopiadores', pathMatch: 'full' },
  { path: 'acopiadores', component: AcopiadoresComponent },
  { path: '**', redirectTo: '/acopiadores' }
];

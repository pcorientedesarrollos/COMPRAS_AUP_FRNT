import { Component } from '@angular/core';
import { Menu } from './shared/menu/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Menu],
  template: '<app-menu></app-menu>',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
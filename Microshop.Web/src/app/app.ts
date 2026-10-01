import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { CatalogComponent } from './components/catalog/catalog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, CatalogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'Microshop.Web';
}

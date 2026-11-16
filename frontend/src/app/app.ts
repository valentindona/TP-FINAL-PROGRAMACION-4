import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ToastHost } from './components/toast/toast-host';
import { ConfirmHost } from './components/confirm/confirm-host';

@Component({
  imports: [RouterOutlet, Header, Footer, ToastHost, ConfirmHost],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}

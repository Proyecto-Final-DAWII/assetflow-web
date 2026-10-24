import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingBar } from './shared/ui/loading-bar/loading-bar';
import { ToastContainer } from './shared/ui/toast-container/toast-container';

@Component({
  selector: 'af-root',
  imports: [RouterOutlet, LoadingBar, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}

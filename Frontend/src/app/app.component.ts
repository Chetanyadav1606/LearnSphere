import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    <div class="loader" [class.hide]="loaded">
      <div class="system">
        <div class="orbit">
          <div class="moon"></div>
        </div>
        <div class="planet"></div>
      </div>
      <p class="quote">"{{ quote }}"</p>
    </div>

    <!-- Navbar lives here ONCE, outside router-outlet — never re-renders on navigation -->
    <app-navbar *ngIf="showNavbar"></app-navbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .loader {
      position: fixed;
      inset: 0;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 48px;
      z-index: 99999;
      transition: opacity 0.9s ease, visibility 0.9s ease;
    }
    .loader.hide { opacity: 0; visibility: hidden; }

    .system {
      position: relative;
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .planet {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 30px rgba(255,255,255,0.5), 0 0 70px rgba(255,255,255,0.15);
      animation: breathe 2s ease-in-out infinite;
      z-index: 2;
    }

    @keyframes breathe {
      0%, 100% { transform: scale(1);    opacity: 1;   }
      50%       { transform: scale(1.12); opacity: 0.8; }
    }

    .orbit {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.1);
      animation: revolve 2.4s linear infinite;
      z-index: 1;
    }

    @keyframes revolve {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }

    .moon {
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #ccc;
      box-shadow: inset -3px -1px 6px rgba(0,0,0,0.6), 0 0 8px rgba(200,200,200,0.3);
      top: -7px;
      left: calc(50% - 7px);
      animation: counter 2.4s linear infinite;
    }

    @keyframes counter {
      from { transform: rotate(0deg);    }
      to   { transform: rotate(-360deg); }
    }

    .quote {
      font-family: 'Georgia', serif;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.35);
      font-style: italic;
      max-width: 360px;
      text-align: center;
      line-height: 1.7;
      letter-spacing: 0.3px;
      animation: fadeInUp 1s ease both;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
  `]
})
export class AppComponent implements OnInit {
  loaded = false;
  showNavbar = false;
  quote = '';

  // Routes that should NOT show the navbar
  private noNavbarRoutes = ['/login', '/register'];

  private quotes = [
    'The beautiful thing about learning is that no one can take it away from you.',
    'Education is the passport to the future.',
    'Live as if you were to die tomorrow. Learn as if you were to live forever.',
    'The more that you read, the more things you will know.',
    'An investment in knowledge pays the best interest.',
    'Learning is not attained by chance; it must be sought with ardor.',
    'The capacity to learn is a gift; the ability to learn is a skill.',
    'Education is not the filling of a pail, but the lighting of a fire.',
    'The mind is not a vessel to be filled, but a fire to be kindled.',
    'Strive for progress, not perfection.',
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    setTimeout(() => this.loaded = true, 2800);

    // Show/hide navbar based on current route
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.showNavbar = !this.noNavbarRoutes.some(r => e.urlAfterRedirects.startsWith(r));
    });
  }
}

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  title = 'Household Expense Tracker';
  today = new Date();

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  get userName(): string {
    return this.auth.currentUser()?.email ?? 'Guest';
  }

  ngOnInit(): void {

    this.updateTitle();

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        this.updateTitle();
      });
  }

  private updateTitle(): void {

    const snapshot = this.deepestChild(
      this.router.routerState.snapshot.root
    );

    this.title =
      (snapshot.data['title'] as string) ??
      'Household Expense Tracker';

    console.log('Header title:', this.title);

    this.cdr.detectChanges();
  }

  private deepestChild(snapshot: any): any {
    return snapshot.firstChild
      ? this.deepestChild(snapshot.firstChild)
      : snapshot;
  }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, NonNullableFormBuilder } from '@angular/forms';
import { Observable, Subscription, combineLatest, filter, map, of } from 'rxjs';
export interface Category {
  title: string;
  autos: Auto[];
}
export interface Auto {
  title: string;
  price: PriceList;
}
export interface PriceList {
  shortPeriod: number;
  mediumPeriod: number;
  longPeriod: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  categories: Category[] = [
    {
      title: 'B',
      autos: [
        {
          title: 'BMW X5',
          price: { shortPeriod: 10000, mediumPeriod: 8000, longPeriod: 5000 },
        },
        {
          title: 'Nissan Quashkai',
          price: { shortPeriod: 9000, mediumPeriod: 7000, longPeriod: 4500 },
        },
        {
          title: 'Ford Focus',
          price: { shortPeriod: 8000, mediumPeriod: 6500, longPeriod: 4000 },
        },
      ],
    },
    {
      title: 'C',
      autos: [
        {
          title: 'Ford Transit',
          price: { shortPeriod: 12000, mediumPeriod: 10000, longPeriod: 8000 },
        },
        {
          title: 'Mercedes-Benz Sprinter',
          price: { shortPeriod: 13000, mediumPeriod: 11000, longPeriod: 9000 },
        },
      ],
    },
  ];

  constructor(private fb: NonNullableFormBuilder) {}

  subscription!: Subscription;
  currentCategory$: Observable<Category | null> = of(null);
  form = this.fb.group({
    category: this.fb.control<Category | null>(null),
    auto: this.fb.control<Auto | null>(null),
    range: this.fb.group({
      start: this.fb.control<Date | null>(null),
      end: this.fb.control<Date | null>(null),
    }),
    price: this.fb.control<null | number>(null),
  });

  ngOnInit(): void {
    this.currentCategory$ = this.form.controls.category.valueChanges;

    this.subscription = combineLatest([
      this.form.controls.auto.valueChanges,
      this.form.controls.range.controls.start.valueChanges,
      this.form.controls.range.controls.end.valueChanges,
    ])
      .pipe(
        map(([auto, startDate, endDate]) => [
          auto?.price,
          Number(endDate?.getDate()) - Number(startDate?.getDate()) + 1,
        ]),
        filter(([price, date]) => Number(date) >= 0)
      )
      .subscribe((val) => {
        console.log(val);
        if (
          typeof val[0] !== 'undefined' &&
          typeof val[0] !== 'number' &&
          typeof val[1] === 'number'
        ) {
          const priceList = val[0];
          const period = val[1];
          const sum =
            period === 1
              ? priceList.shortPeriod * period
              : period >= 2 && period <= 5
              ? priceList.mediumPeriod * period
              : priceList.longPeriod * period;
          this.form.controls.price.setValue(sum);
        }
      });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Currency } from 'src/app/models/currency';
import { CurrencyService } from 'src/app/services/currency.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-converter-page',
  templateUrl: './converter-page.component.html',
  styleUrls: ['./converter-page.component.scss']
})
export class ConverterPageComponent implements OnInit, OnDestroy {

  public convertForm!: FormGroup;

  public currency: Currency[] = [
    { value: 'UAH', name: 'UAH - Ukrainian hryvnia' },
    { value: 'USD', name: 'USD - United States dollar' },
    { value: 'EUR', name: 'EUR - Euro' },
    { value: 'GBP', name: 'GBP - British Pound' },
  ];

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb : FormBuilder,
    private currencyService: CurrencyService) {
  }

  ngOnInit(): void {
    this.convertForm = this.fb.group({
      firstAmount: new FormControl('', [Validators.min(0.01)]),
      secondAmount: new FormControl('', [Validators.min(0.01)]),
      firstCurrency: new FormControl('USD', Validators.required),
      secondCurrency: new FormControl('UAH', Validators.required)
    })
  }

  get firstAmount() {
    return this.convertForm.get('firstAmount');
  }

  get secondAmount() {
    return this.convertForm.get('secondAmount');
  }

  get firstCurrency() {
    return this.convertForm.get('firstCurrency');
  }

  get secondCurrency() {
    return this.convertForm.get('secondCurrency');
  }

  public convertCurrency(input: string, control: AbstractControl<any> | null): void {
    if(control?.value && control.valid) {
      let from = this.firstCurrency?.value;
      let to = this.secondCurrency?.value;
      if(input === 'to') {
        [from, to] = [to, from];
      }
      this.currencyService.getConvCurrency(from, to, control.value).pipe(takeUntil(this.destroy$)).subscribe(data => {
        if(data) {
          console.log(data);
          const res = JSON.stringify(data);
          const currjson = JSON.parse(res);
          input === 'from' ? this.secondAmount?.setValue(currjson.result) : this.firstAmount?.setValue(currjson.result);
        }
      })
    }
  }

  public switchValues(): void {
    this.firstAmount?.setValue([this.secondAmount?.value, this.secondAmount?.setValue(this.firstAmount?.value)][0]);
    this.firstCurrency?.setValue([this.secondCurrency?.value, this.secondCurrency?.setValue(this.firstCurrency?.value)][0]);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}

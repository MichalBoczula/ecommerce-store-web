import { Observable } from "rxjs";
import { Currency } from "../model/currency.model";

export abstract class CurrencyRepository {
    abstract getCurrencies(): Observable<Currency[]>;
}
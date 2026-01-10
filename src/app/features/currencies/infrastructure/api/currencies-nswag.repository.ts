import { map, Observable } from "rxjs";
import { Client, CurrencyDto } from "../../../../shared/api/nswag/api-client";
import { CurrencyRepository } from "../../domain/interfaces/currency.repository";
import { inject, Injectable } from "@angular/core";
import { mapCurrencyDtoToDomain } from "../mapper/currency.dto";
import { Currency } from "../../domain/model/currency.model";

@Injectable()
export class CurrenciesNswagRepository implements CurrencyRepository {
    private readonly api = inject(Client);

    getCurrencies(): Observable<Currency[]> {
        return this.api.getCurrencies().pipe
            (
                map(result => result.map(mapCurrencyDtoToDomain))
            )
    }
}
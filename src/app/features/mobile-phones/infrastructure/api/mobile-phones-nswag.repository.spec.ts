import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MobilePhonesNswagRepository } from './mobile-phones-nswag.repository';
import { Client } from '../../../../shared/api/nswag/api-client';

describe('MobilePhonesNswagRepository', () => {
    let repository: MobilePhonesNswagRepository;
    let api: jasmine.SpyObj<Client>;

    beforeEach(() => {
        api = jasmine.createSpyObj<Client>('Client', [
            'getMobilePhones',
            'getMobilePhoneById',
            'createMobilePhone',
            'getTopMobilePhones',
            'getFiltered_MobilePhones',
        ]);

        TestBed.configureTestingModule({
            providers: [
                MobilePhonesNswagRepository,
                { provide: Client, useValue: api },
            ],
        });

        repository = TestBed.inject(MobilePhonesNswagRepository);
    });

    it('should call getMobilePhones and map result', (done) => {
        const dtos = [
            { id: '1', commonDescription: { name: 'Phone 1' } },
        ] as any[];

        api.getMobilePhones.and.returnValue(of(dtos));

        repository.getAll(5).subscribe(result => {
            expect(api.getMobilePhones).toHaveBeenCalledWith(5);
            expect(result.length).toBe(1);
            done();
        });
    });

    it('should call getMobilePhoneById and map result', (done) => {
        const dto = { id: 'abc' } as any;
        api.getMobilePhoneById.and.returnValue(of(dto));

        repository.getById('abc').subscribe(result => {
            expect(api.getMobilePhoneById).toHaveBeenCalledWith('abc');
            expect(result).toBeTruthy();
            done();
        });
    });

    it('should call getTopMobilePhones and map result', (done) => {
        const dtos = [{ id: 'top-1' }] as any[];
        api.getTopMobilePhones.and.returnValue(of(dtos));

        repository.getTopMobilePhones().subscribe(result => {
            expect(api.getTopMobilePhones).toHaveBeenCalled();
            expect(result.length).toBe(1);
            done();
        });
    });

    it('should call getFiltered_MobilePhones with filter', (done) => {
        const filter = { brand: 'Samsung' } as any;
        const dtos = [{ id: '1' }] as any[];

        api.getFiltered_MobilePhones.and.returnValue(of(dtos));

        repository.getFilteredMobilePhones(filter).subscribe(result => {
            expect(api.getFiltered_MobilePhones).toHaveBeenCalledWith(filter);
            expect(result.length).toBe(1);
            done();
        });
    });
});
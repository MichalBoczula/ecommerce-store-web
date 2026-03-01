import { mobilePhonesFeature, MobilePhonesState } from './mobile-phones.feature';
import { MobilePhone } from '../domain/model/mobile-phone';
import { MobilePhoneDetails } from '../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../domain/model/top-mobile-phone';

describe('mobilePhonesFeature selectors', () => {
    const state: { mobilePhones: MobilePhonesState } = {
        mobilePhones: {
            status: 'loaded',
            items: [{ id: '1' }] as MobilePhone[],
            topMobilePhones: [{ id: 'top-1' }] as TopMobilePhone[],
            selectedItem: { id: 'details-1' } as MobilePhoneDetails,
            error: 'error text',
        },
    };

    it('should select items', () => {
        const result = mobilePhonesFeature.selectItems(state);
        expect(result).toEqual(state.mobilePhones.items);
    });

    it('should select status', () => {
        const result = mobilePhonesFeature.selectStatus(state);
        expect(result).toBe('loaded');
    });

    it('should select error', () => {
        const result = mobilePhonesFeature.selectError(state);
        expect(result).toBe('error text');
    });

    it('should select selectedItem', () => {
        const result = mobilePhonesFeature.selectSelectedItem(state);
        expect(result).toEqual(state.mobilePhones.selectedItem);
    });

    it('should select topMobilePhones', () => {
        const result = mobilePhonesFeature.selectTopMobilePhones(state);
        expect(result).toEqual(state.mobilePhones.topMobilePhones);
    });
});
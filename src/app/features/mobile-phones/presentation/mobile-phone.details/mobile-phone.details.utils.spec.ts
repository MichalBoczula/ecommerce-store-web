import {
  asLines,
  isNotNullOrWhiteSpace,
  toDescriptions,
  toProductName,
  toGalleryPhotos,
  toGlanceRows,
  toSpecRows,
} from './mobile-phone.details.utils';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';

describe('mobile-phone.details.utils', () => {
  describe('asLines', () => {
    it('wraps a string into an array', () => {
      expect(asLines('x')).toEqual(['x']);
    });

    it('returns the same array when value is already an array', () => {
      expect(asLines(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('preserves empty string', () => {
      expect(asLines('')).toEqual(['']);
    });
  });

  describe('isNotNullOrWhiteSpace', () => {
    it('returns false for null/undefined', () => {
      expect(isNotNullOrWhiteSpace(null)).toBe(false);
      expect(isNotNullOrWhiteSpace(undefined)).toBe(false);
    });

    it('returns false for empty/whitespace', () => {
      expect(isNotNullOrWhiteSpace('')).toBe(false);
      expect(isNotNullOrWhiteSpace('   ')).toBe(false);
      expect(isNotNullOrWhiteSpace('\n\t')).toBe(false);
    });

    it('returns true for non-empty', () => {
      expect(isNotNullOrWhiteSpace('ok')).toBe(true);
      expect(isNotNullOrWhiteSpace(' ok ')).toBe(true);
    });
  });

  describe('toDescriptions', () => {
    it('always returns exactly 3 strings (empty when missing)', () => {
      const res = toDescriptions({
        commonDescription: { description: 'A' },
      } as MobilePhoneDetails);

      expect(res).toEqual(['A', '', '']);
      expect(res.length).toBe(3);

      res.forEach((x) => expect(typeof x).toBe('string'));
    });

    it('keeps description2/description3 when provided', () => {
      const res = toDescriptions({
        commonDescription: { description: 'A' },
        description2: 'B',
        description3: 'C',
      } as MobilePhoneDetails);

      expect(res).toEqual(['A', 'B', 'C']);
    });
  });

  describe('toSpecRows', () => {
    const byLabel = (rows: ReturnType<typeof toSpecRows>, label: string) =>
      rows.find((r) => r.label === label);

    it('does not throw when nested objects are missing', () => {
      expect(() => toSpecRows({} as MobilePhoneDetails)).not.toThrow();
      expect(() =>
        toSpecRows({ electronicDetails: undefined } as MobilePhoneDetails),
      ).not.toThrow();
      expect(() => toSpecRows({ connectivity: undefined } as MobilePhoneDetails)).not.toThrow();
      expect(() => toSpecRows({ sensors: undefined } as MobilePhoneDetails)).not.toThrow();
      expect(() =>
        toSpecRows({ satelliteNavigationSystems: undefined } as MobilePhoneDetails),
      ).not.toThrow();
    });

    it('adds text row for simple strings', () => {
      const rows = toSpecRows({ camera: '50MP' } as MobilePhoneDetails);
      expect(byLabel(rows, 'Cameras')).toEqual({ label: 'Cameras', kind: 'text', value: '50MP' });
    });

    it('skips null/undefined/whitespace strings', () => {
      const rows1 = toSpecRows({ camera: null } as MobilePhoneDetails);
      const rows2 = toSpecRows({ camera: undefined } as MobilePhoneDetails);
      const rows3 = toSpecRows({ camera: '   ' } as MobilePhoneDetails);

      expect(byLabel(rows1, 'Cameras')).toBeUndefined();
      expect(byLabel(rows2, 'Cameras')).toBeUndefined();
      expect(byLabel(rows3, 'Cameras')).toBeUndefined();
    });

    it('formats numeric fields (GB/Hz/mm/\\"/mAh)', () => {
      const rows = toSpecRows({
        id: 'phone-id',
        electronicDetails: {
          ram: '8',
          storage: '256',
          refreshRateHz: 120,
          screenSizeInches: 6.5,
          width: 71.2,
          height: 152.3,
          batteryCapacity: 5000,
        },
      } as MobilePhoneDetails);

      expect(byLabel(rows, 'RAM')).toEqual({ label: 'RAM', kind: 'text', value: '8 GB' });
      expect(byLabel(rows, 'Storage')).toEqual({ label: 'Storage', kind: 'text', value: '256 GB' });
      expect(byLabel(rows, 'Refresh rate')).toEqual({
        label: 'Refresh rate',
        kind: 'text',
        value: '120 Hz',
      });
      expect(byLabel(rows, 'Screen size')).toEqual({
        label: 'Screen size',
        kind: 'text',
        value: '6.5"',
      });
      expect(byLabel(rows, 'Width')).toEqual({ label: 'Width', kind: 'text', value: '71.2 mm' });
      expect(byLabel(rows, 'Height')).toEqual({ label: 'Height', kind: 'text', value: '152.3 mm' });
      expect(byLabel(rows, 'Battery capacity')).toEqual({
        label: 'Battery capacity',
        kind: 'text',
        value: '5000 mAh',
      });
    });

    it('skips empty or zero formatted fields', () => {
      const rows = toSpecRows({
        id: 'phone-id',
        electronicDetails: {
          ram: '',
          refreshRateHz: 0,
          width: 0,
        },
      } as MobilePhoneDetails);

      expect(byLabel(rows, 'RAM')).toBeUndefined();
      expect(byLabel(rows, 'Refresh rate')).toBeUndefined();
      expect(byLabel(rows, 'Width')).toBeUndefined();
    });

    it('adds array values as multiple lines (kind=text with string[]) and trims entries', () => {
      const rows = toSpecRows({
        camera: ['  12MP  ', '', '  ', '8MP'],
      } as unknown as MobilePhoneDetails);

      expect(byLabel(rows, 'Cameras')).toEqual({
        label: 'Cameras',
        kind: 'text',
        value: ['12MP', '8MP'],
      });
    });

    it('adds bool rows for true/false and keeps false (does not skip it)', () => {
      const rows = toSpecRows({
        fingerPrint: true,
        faceId: false,
      } as MobilePhoneDetails);

      expect(byLabel(rows, 'Fingerprint reader')).toEqual({
        label: 'Fingerprint reader',
        kind: 'bool',
        value: true,
      });
      expect(byLabel(rows, 'Face ID')).toEqual({ label: 'Face ID', kind: 'bool', value: false });
    });

    it('skips bool rows for null/undefined', () => {
      const rows = toSpecRows({
        fingerPrint: null,
        faceId: undefined,
        connectivity: { nfc: null, bluetooth: undefined },
      } as MobilePhoneDetails);

      expect(byLabel(rows, 'Fingerprint reader')).toBeUndefined();
      expect(byLabel(rows, 'Face ID')).toBeUndefined();
      expect(byLabel(rows, 'NFC')).toBeUndefined();
      expect(byLabel(rows, 'Bluetooth')).toBeUndefined();
    });

    it('adds nested bool flags from connectivity/sensors/satelliteNavigationSystems', () => {
      const rows = toSpecRows({
        connectivity: { nfc: true, bluetooth: false },
        sensors: { gyroscope: true },
        satelliteNavigationSystems: { gps: true, galileo: false },
      } as MobilePhoneDetails);

      expect(byLabel(rows, 'NFC')).toEqual({ label: 'NFC', kind: 'bool', value: true });
      expect(byLabel(rows, 'Bluetooth')).toEqual({
        label: 'Bluetooth',
        kind: 'bool',
        value: false,
      });

      expect(byLabel(rows, 'Gyroscope')).toEqual({ label: 'Gyroscope', kind: 'bool', value: true });

      expect(byLabel(rows, 'GPS')).toEqual({ label: 'GPS', kind: 'bool', value: true });
      expect(byLabel(rows, 'Galileo')).toEqual({ label: 'Galileo', kind: 'bool', value: false });
    });

    it('keeps row order (sanity check for UI expectations)', () => {
      const rows = toSpecRows({
        camera: 'cam',
        electronicDetails: { cpu: 'cpu' },
        fingerPrint: true,
        connectivity: { nfc: true },
      } as MobilePhoneDetails);

      expect(rows.map((r) => r.label)).toEqual(['Cameras', 'CPU', 'Fingerprint reader', 'NFC']);
    });
  });
  it('keeps names readable without duplicating brands or rendering undefined', () => {
    expect(
      toProductName({ id: '1', commonDescription: { brand: 'Apple', name: 'Apple iPhone' } }),
    ).toBe('Apple iPhone');
    expect(toProductName({ id: '1', commonDescription: { brand: 'Apple', name: 'iPhone' } })).toBe(
      'Apple iPhone',
    );
    expect(toProductName({ id: '1' })).toBe('Mobile phone');
    expect(toProductName({ id: '1', commonDescription: { name: '  Model  ' } })).toBe('Model');
  });
  it('uses only unique nonblank API photo URLs in their original order', () => {
    expect(
      toGalleryPhotos({
        id: '1',
        commonDescription: {
          mainPhoto: ' main ',
          otherPhotos: ['main', '', 'front', 'front', 'side'],
        },
      }),
    ).toEqual(['main', 'front', 'side']);
    expect(toGalleryPhotos({ id: '1' })).toEqual([]);
  });
  it('preserves supplied RAM/storage units and builds glance rows without unsupported claims', () => {
    const phone = {
      id: '1',
      electronicDetails: {
        ram: '8 GB',
        storage: '256 GB',
        cpu: 'A19',
        displayType: 'OLED',
        screenSizeInches: 6.3,
        refreshRateHz: 120,
      },
      connectivity: { has5G: true, wiFi: true, nfc: false },
    };
    const rows = toSpecRows(phone);
    expect(rows.find((row) => row.label === 'RAM')?.value).toBe('8 GB');
    expect(rows.find((row) => row.label === 'Storage')?.value).toBe('256 GB');
    expect(toGlanceRows(phone)).toEqual([
      { label: 'Display', value: '6.3″ · OLED · 120 Hz' },
      { label: 'Processor', value: 'A19' },
      { label: 'Memory', value: '8 GB RAM · 256 GB storage' },
      { label: 'Connectivity', value: '5G · Wi-Fi' },
    ]);
    expect(toGlanceRows({ id: '1' })).toEqual([]);
  });
});

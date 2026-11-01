import type { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';
export type SpecRow =
  | { label: string; kind: 'text'; value: string | string[] }
  | { label: string; kind: 'bool'; value: boolean };

export function withUnit(value: string | null | undefined, unit: string): string | null {
  const text = value?.trim();
  if (!text) return null;
  return text.toLowerCase().endsWith(unit.toLowerCase()) ? text : `${text} ${unit}`;
}

export function asLines(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

export function isNotNullOrWhiteSpace(v: string | null | undefined): boolean {
  return (v ?? '').trim().length > 0;
}

export function toDescriptions(details: MobilePhoneDetails): string[] {
  return [
    details?.commonDescription?.description ?? '',
    details?.description2 ?? '',
    details?.description3 ?? '',
  ];
}

export function toSpecRows(mobilePhone: MobilePhoneDetails): SpecRow[] {
  const rows: SpecRow[] = [];

  const add = (label: string, value: unknown) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      const arr = value.map((x) => String(x).trim()).filter((x) => x.length > 0);
      if (arr.length) rows.push({ label, kind: 'text', value: arr });
      return;
    }

    const s = String(value).trim();
    if (s.length) rows.push({ label, kind: 'text', value: s });
  };

  const addBool = (label: string, value: boolean | null | undefined) => {
    if (value === null || value === undefined) return;
    rows.push({ label, kind: 'bool', value });
  };

  add('Cameras', mobilePhone?.camera);

  add('CPU', mobilePhone?.electronicDetails?.cpu);
  add('GPU', mobilePhone?.electronicDetails?.gpu);
  add('RAM', withUnit(mobilePhone?.electronicDetails?.ram, 'GB'));
  add('Storage', withUnit(mobilePhone?.electronicDetails?.storage, 'GB'));
  add('Display type', mobilePhone?.electronicDetails?.displayType);
  add(
    'Refresh rate',
    mobilePhone?.electronicDetails?.refreshRateHz
      ? `${mobilePhone.electronicDetails.refreshRateHz} Hz`
      : null,
  );
  add(
    'Screen size',
    mobilePhone?.electronicDetails?.screenSizeInches
      ? `${mobilePhone.electronicDetails.screenSizeInches}"`
      : null,
  );
  add(
    'Width',
    mobilePhone?.electronicDetails?.width ? `${mobilePhone.electronicDetails.width} mm` : null,
  );
  add(
    'Height',
    mobilePhone?.electronicDetails?.height ? `${mobilePhone.electronicDetails.height} mm` : null,
  );
  add('Battery type', mobilePhone?.electronicDetails?.batteryType);
  add(
    'Battery capacity',
    mobilePhone?.electronicDetails?.batteryCapacity
      ? `${mobilePhone.electronicDetails.batteryCapacity} mAh`
      : null,
  );

  addBool('Fingerprint reader', mobilePhone?.fingerPrint);
  addBool('Face ID', mobilePhone?.faceId);

  addBool('5G', mobilePhone?.connectivity?.has5G);
  addBool('Wi-Fi', mobilePhone?.connectivity?.wiFi);
  addBool('NFC', mobilePhone?.connectivity?.nfc);
  addBool('Bluetooth', mobilePhone?.connectivity?.bluetooth);

  addBool('GPS', mobilePhone?.satelliteNavigationSystems?.gps);
  addBool('A-GPS', mobilePhone?.satelliteNavigationSystems?.agps);
  addBool('Galileo', mobilePhone?.satelliteNavigationSystems?.galileo);
  addBool('Glonass', mobilePhone?.satelliteNavigationSystems?.glonass);
  addBool('QZSS', mobilePhone?.satelliteNavigationSystems?.qzss);

  addBool('Accelerometer', mobilePhone?.sensors?.accelerometer);
  addBool('Gyroscope', mobilePhone?.sensors?.gyroscope);
  addBool('Proximity', mobilePhone?.sensors?.proximity);
  addBool('Compass', mobilePhone?.sensors?.compass);
  addBool('Barometer', mobilePhone?.sensors?.barometer);
  addBool('Hall sensor', mobilePhone?.sensors?.halla);
  addBool('Ambient light', mobilePhone?.sensors?.ambientLight);

  return rows;
}

export function toProductName(mobilePhone: MobilePhoneDetails): string {
  const brand = mobilePhone.commonDescription?.brand?.trim() ?? '';
  const name = mobilePhone.commonDescription?.name?.trim() ?? '';
  if (!name) return brand || 'Mobile phone';
  return !brand ||
    name.toLowerCase() === brand.toLowerCase() ||
    name.toLowerCase().startsWith(brand.toLowerCase() + ' ')
    ? name
    : `${brand} ${name}`;
}

export function toGalleryPhotos(details: MobilePhoneDetails): string[] {
  return [
    ...new Set(
      [details.commonDescription?.mainPhoto, ...(details.commonDescription?.otherPhotos ?? [])]
        .filter((photo): photo is string => typeof photo === 'string' && !!photo.trim())
        .map((photo) => photo.trim()),
    ),
  ];
}

export function toGlanceRows(details: MobilePhoneDetails): { label: string; value: string }[] {
  const spec = details.electronicDetails;
  const rows = [
    {
      label: 'Display',
      value: [
        spec?.screenSizeInches ? `${spec.screenSizeInches}″` : null,
        spec?.displayType,
        spec?.refreshRateHz ? `${spec.refreshRateHz} Hz` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    { label: 'Processor', value: spec?.cpu?.trim() ?? '' },
    {
      label: 'Memory',
      value: [
        spec?.ram?.trim() ? `${withUnit(spec.ram, 'GB')} RAM` : null,
        spec?.storage?.trim() ? `${withUnit(spec.storage, 'GB')} storage` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    {
      label: 'Connectivity',
      value: [
        ['5G', details.connectivity?.has5G],
        ['NFC', details.connectivity?.nfc],
        ['Wi-Fi', details.connectivity?.wiFi],
        ['Bluetooth', details.connectivity?.bluetooth],
      ]
        .filter(([, value]) => value === true)
        .map(([label]) => label)
        .join(' · '),
    },
  ];
  return rows.filter((row) => !!row.value);
}

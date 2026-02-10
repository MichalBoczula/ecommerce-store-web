import type { MobilePhoneDetailsDto } from '../../../../shared/api/nswag/api-client';
import type { SpecRow } from './mobile-phone.details';

export function asLines(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
}

export function isNotNullOrWhiteSpace(v: string | null | undefined): boolean {
    return (v ?? '').trim().length > 0;
}

export function toDescriptions(details: MobilePhoneDetailsDto): string[] {
    return [
        details?.commonDescription?.description ?? '',
        details?.description2 ?? '',
        details?.description3 ?? '',
    ];
}

export function toSpecRows(mobilePhone: MobilePhoneDetailsDto): SpecRow[] {
    const rows: SpecRow[] = [];

    const add = (label: string, value: unknown) => {
        if (value === null || value === undefined) return;

        if (Array.isArray(value)) {
            const arr = value
                .map(x => String(x).trim())
                .filter(x => x.length > 0);
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
    add('RAM', mobilePhone?.electronicDetails?.ram ? `${mobilePhone.electronicDetails.ram} GB` : null);
    add('Storage', mobilePhone?.electronicDetails?.storage ? `${mobilePhone.electronicDetails.storage} GB` : null);
    add('Display type', mobilePhone?.electronicDetails?.displayType);
    add('Refresh rate', mobilePhone?.electronicDetails?.refreshRateHz ? `${mobilePhone.electronicDetails.refreshRateHz} Hz` : null);
    add('Screen size', mobilePhone?.electronicDetails?.screenSizeInches ? `${mobilePhone.electronicDetails.screenSizeInches}"` : null);
    add('Width', mobilePhone?.electronicDetails?.width ? `${mobilePhone.electronicDetails.width} mm` : null);
    add('Height', mobilePhone?.electronicDetails?.height ? `${mobilePhone.electronicDetails.height} mm` : null);
    add('Battery type', mobilePhone?.electronicDetails?.batteryType);
    add('Battery capacity', mobilePhone?.electronicDetails?.batteryCapacity ? `${mobilePhone.electronicDetails.batteryCapacity} mAh` : null);

    addBool('FingerPrint', mobilePhone?.fingerPrint);
    addBool('FaceId', mobilePhone?.faceId);

    addBool('5G', mobilePhone?.connectivity?.has5G);
    addBool('Wi-Fi', mobilePhone?.connectivity?.wiFi);
    addBool('NFC', mobilePhone?.connectivity?.nfc);
    addBool('Bluetooth', mobilePhone?.connectivity?.bluetooth);

    addBool('GPS', mobilePhone?.satelliteNavigationSystems?.gps);
    addBool('AGPD', mobilePhone?.satelliteNavigationSystems?.agps);
    addBool('Galileo', mobilePhone?.satelliteNavigationSystems?.galileo);
    addBool('Glonass', mobilePhone?.satelliteNavigationSystems?.glonass);
    addBool('QZSS', mobilePhone?.satelliteNavigationSystems?.qzss);

    addBool('Accelerometer', mobilePhone?.sensors?.accelerometer);
    addBool('Gyroscope', mobilePhone?.sensors?.gyroscope);
    addBool('Proximity', mobilePhone?.sensors?.proximity);
    addBool('Compass', mobilePhone?.sensors?.compass);
    addBool('Barometer', mobilePhone?.sensors?.barometer);
    addBool('Halla', mobilePhone?.sensors?.halla);
    addBool('AmbientLight', mobilePhone?.sensors?.ambientLight);

    return rows;
}

export interface EEGReading {
    index: number;
    electrode: number;
    timestamp: number;
    samples: number[];
}
export interface TelemetryData {
    sequenceId: number;
    batteryLevel: number;
    fuelGaugeVoltage: number;
    temperature: number;
}
export interface XYZ {
    x: number;
    y: number;
    z: number;
}
export interface AccelerometerData {
    sequenceId: number;
    samples: XYZ[];
}
export interface MuseControlResponse {
    rc: number;
    [key: string]: string | number;
}
export interface MuseDeviceInfo extends MuseControlResponse {
    ap: string;
    bl: string;
    bn: number;
    fw: string;
    hw: string;
    pv: number;
    sp: string;
    tp: string;
}
export declare type GyroscopeData = AccelerometerData;

/// <reference types="web-bluetooth" />
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { AccelerometerData, EEGReading, GyroscopeData, MuseControlResponse, MuseDeviceInfo, TelemetryData, XYZ } from './lib/muse-interfaces';
import { EEGSpectrum, EEGAbsolutePowerBand, EEGRelativePowerBand } from './lib/process-samples';
export { zipSamples, EEGSample } from './lib/zip-samples';
export { zipSamplesToSpectrum, EEGSpectrum } from './lib/process-samples';
export { EEGReading, TelemetryData, AccelerometerData, GyroscopeData, XYZ, MuseControlResponse };
export declare const MUSE_SERVICE = 65165;
export declare const EEG_FREQUENCY = 256;
export declare const channelNames: string[];
export declare class MuseClient {
    enableAux: boolean;
    deviceName: string | null;
    connectionStatus: BehaviorSubject<boolean>;
    rawControlData: Observable<string>;
    controlResponses: Observable<MuseControlResponse>;
    telemetryData: Observable<TelemetryData>;
    gyroscopeData: Observable<GyroscopeData>;
    accelerometerData: Observable<AccelerometerData>;
    eegReadings: Observable<EEGReading>;
    rawFFT: Observable<EEGSpectrum>;
    absoluteBandPowers: Observable<EEGAbsolutePowerBand[]>;
    relativeBandPowers: Observable<EEGRelativePowerBand[]>;
    private gatt;
    private controlChar;
    private eegCharacteristics;
    private lastIndex;
    private lastTimestamp;
    connect(gatt?: BluetoothRemoteGATTServer): Promise<void>;
    sendCommand(cmd: string): Promise<void>;
    start(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    deviceInfo(): Promise<MuseDeviceInfo>;
    disconnect(): void;
    private getTimestamp(eventIndex);
}
export { EEGRelativePowerBand, POWER_BANDS, FrequencyBand } from './lib/process-samples';

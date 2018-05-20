import { Observable } from 'rxjs/Observable';
import { EEGReading } from './muse-interfaces';
export interface EEGSample {
    index: number;
    timestamp: number;
    data: number[];
}
export declare function zipSamples(eegReadings: Observable<EEGReading>): Observable<EEGSample>;
export interface EEGTimeSeries {
    timestamp: number;
    data: number[][];
}
export declare function zipSamplesToTimeSeries(eegReadings: Observable<EEGReading>, bufferSize: number, bufferOverlap: number): Observable<EEGTimeSeries>;

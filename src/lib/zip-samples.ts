import { Observable } from 'rxjs/Observable';
import { EEG_FREQUENCY } from './../muse';
import { EEGReading } from './muse-interfaces';

import { from } from 'rxjs/observable/from';
import { concat } from 'rxjs/operators/concat';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { bufferCount } from 'rxjs/operators/bufferCount';
import { map } from 'rxjs/operators/map';
import { skipLast } from 'rxjs/operators/skipLast';

export interface EEGSample {
    index: number;
    timestamp: number; // milliseconds since epoch
    data: number[];
}

export function zipSamples(eegReadings: Observable<EEGReading>): Observable<EEGSample> {
    const buffer: EEGReading[] = [];
    let lastTimestamp: number | null = null;
    return eegReadings.pipe(
        mergeMap<EEGReading, EEGReading[]>((reading) => {
            if (reading.timestamp !== lastTimestamp) {
                lastTimestamp = reading.timestamp;
                if (buffer.length) {
                    const result = from([[...buffer]]);
                    buffer.splice(0, buffer.length, reading);
                    return result;
                }
            }
            buffer.push(reading);
            return from([]);
        }),
        concat(from([buffer])),
        mergeMap((readings: EEGReading[]) => {
            const result = readings[0].samples.map((x, index) => {
                const data = [NaN, NaN, NaN, NaN, NaN];
                for (const reading of readings) {
                    data[reading.electrode] = reading.samples[index];
                }
                return {
                    data,
                    index: readings[0].index,
                    timestamp: readings[0].timestamp + index * 1000. / EEG_FREQUENCY,
                };
            });
            return from(result);
        }),
    );
}

export interface EEGTimeSeries {
    timestamp: number;
    data: number[][]; // first dimension is the electrode, second is time
}

export function zipSamplesToTimeSeries(
    eegReadings: Observable<EEGReading>,
    bufferSize: number,
    bufferOverlap: number
): Observable<EEGTimeSeries> {
    return zipSamples(eegReadings).pipe(
        bufferCount(bufferSize, bufferOverlap)
    ,
        // skip incomplete readings
        skipLast(Math.floor(bufferSize / bufferOverlap))
    ,
        map((zippedReadings: EEGSample[]): EEGTimeSeries => {
            return {
                timestamp: zippedReadings[0].timestamp,
                data: zippedReadings[0].data.map( (_, electrodeId) =>
                    zippedReadings.map(
                        zippedReading => zippedReading.data[electrodeId]
                    )
                )
            };
        })
    );
}

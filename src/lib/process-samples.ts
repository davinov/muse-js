import { Observable } from 'rxjs/Observable';
import { RFFT, WindowFunction } from 'dsp.js';
import { EEG_FREQUENCY } from './../muse';
import { EEGTimeSeries, zipSamplesToTimeSeries } from './zip-samples';
import { EEGReading } from './muse-interfaces';

import { map } from 'rxjs/operators/map';

export const FFT_BUFFER_SIZE = 256;
export const FFT_WINDOW_OVERLAP = 26;

let fft = new RFFT(FFT_BUFFER_SIZE, EEG_FREQUENCY);

/*  From an array of measures, apply a Hamming window and a Fast Fourier Transform

    The resulting spectrum contains of 128 frequency bands, the first one
    representing the constant part (0Hz), the next ones having a width of 1Hz.
*/
export function computeSpectrum(timeSerie: number[]): Float64Array {
    fft.forward(timeSerie.map(
        (v, i) => WindowFunction.Hamming(timeSerie.length, i) * v
    ));
    return fft.spectrum;
}

export interface EEGSpectrum {
    timestamp: number
    spectrum: Float64Array[]
}

export function zipSamplesToSpectrum(eggSamples: Observable<EEGReading>): Observable<EEGSpectrum> {
    return zipSamplesToTimeSeries(eggSamples, FFT_BUFFER_SIZE, 26).pipe(
        map((eegTimeSeries: EEGTimeSeries): EEGSpectrum => {
            console.log(eegTimeSeries.data)
            return {
                timestamp: eegTimeSeries.timestamp,
                spectrum: eegTimeSeries.data.map(computeSpectrum)
            };
        })
    );
}
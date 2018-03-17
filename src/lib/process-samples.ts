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
    data: Float64Array[]
}

export function zipSamplesToSpectrum(eggSamples: Observable<EEGReading>): Observable<EEGSpectrum> {
    return zipSamplesToTimeSeries(eggSamples, FFT_BUFFER_SIZE, FFT_WINDOW_OVERLAP).pipe(
        map((eegTimeSeries: EEGTimeSeries): EEGSpectrum => {
            return {
                timestamp: eegTimeSeries.timestamp,
                data: eegTimeSeries.data.map(
                    d => new Float64Array(computeSpectrum(d))
                )
            };
        })
    );
}

export interface EEGTotalSpectrum {
    timestamp: number
    data: Float64Array
}

export function computeTotalSpectrum(spectrumByElectrode: EEGSpectrum): EEGTotalSpectrum {
    return {
        timestamp: spectrumByElectrode.timestamp,
        data: spectrumByElectrode.data[0].map( (freqValue, freq) =>
            spectrumByElectrode.data
                .map( (spectrum) => spectrum[freq] )
                .filter(isFinite)
                .reduce( (sum, v) => sum + v , 0)
        )
    }
}

export interface FrequencyBand {
    id: string
    label: string
    range: [number, number]
}

export interface EEGAbsolutePowerBand {
    band: FrequencyBand
    power: number
}

export function computeAbsolutePowerBand(band: FrequencyBand, totalSpectrum: EEGTotalSpectrum): EEGAbsolutePowerBand {
    return {
        band: band,
        power: Math.log(
            totalSpectrum.data.reduce( (totalPower, freqPower, freq) => {
                // This is a pretty naive implentation, case of float frequencies should be addressed
                if ( (freq >= band.range[0]) && (freq <= band.range[1]) && isFinite(freqPower)) {
                    return totalPower + freqPower;
                } else {
                    return totalPower;
                }
            }, 0 )
        )
    };
}

export const POWER_BANDS:{ [index: string]: FrequencyBand } = {
    LOW: {
        id: 'LOW',
        label: 'Low frequencies',
        range: [2.5, 6.1]
    },
    DELTA: {
        id: 'DELTA',
        label: 'Delta waves',
        range: [1, 4]
    },
    THETA: {
        id: 'THETA',
        label: 'Theta waves',
        range: [4, 8]
    },
    ALPHA: {
        id: 'ALPHA',
        label: 'Alpha waves',
        range: [7.5, 13]
    },
    BETA: {
        id: 'BETA',
        label: 'Beta waves',
        range: [13, 30]
    },
    GAMMA: {
        id: 'GAMMA',
        label: 'Gamma waves',
        range: [30, 44]
    },
};

export function computeAbsolutePowerBands(totalSpectrum: EEGTotalSpectrum): EEGAbsolutePowerBand[] {
    return Object.keys(POWER_BANDS).map(
        k => computeAbsolutePowerBand(POWER_BANDS[k], totalSpectrum)
    );
}

export function spectrumToAbsolutePowerBands(eggSpectrum: Observable<EEGSpectrum>): Observable<EEGAbsolutePowerBand[]> {
    return eggSpectrum.pipe(
        map(d => computeTotalSpectrum(d))
    ,
        map(d => computeAbsolutePowerBands(d))
    );
}

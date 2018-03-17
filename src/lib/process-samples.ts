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
                .reduce( (sum, v) => sum + v )
        )
    }
}

export interface FrequencyBand {
    label: string
    range: [number, number]
}

export interface EEGPowerBand {
    band: FrequencyBand
    power: number
}

export function computePowerBand(band: FrequencyBand, totalSpectrum: EEGTotalSpectrum): EEGPowerBand {
    return {
        band: band,
        power: totalSpectrum.data.reduce( (totalPower, freqPower, freq) => {
            // This is a pretty naive implentation, case of float frequencies should be addressed
            if ( (freq >= band.range[0]) && (freq <= band.range[1]) ) {
                return totalPower + freqPower;
            } else {
                return totalPower;
            }
        } )
    };
}

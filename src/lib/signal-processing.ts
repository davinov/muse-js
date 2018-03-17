import { EEG_FREQUENCY } from './../muse';
import { RFFT, WindowFunction } from 'dsp.js';

export const FFT_BUFFER_SIZE = 256;

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

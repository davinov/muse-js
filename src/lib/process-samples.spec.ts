import { Observable } from 'rxjs/Observable';
import { EEGReading } from './muse-interfaces';

import { from } from 'rxjs/observable/from';
import { toArray } from 'rxjs/operators/toArray';

import {
    FFT_BUFFER_SIZE, FFT_WINDOW_OVERLAP,
    computeSpectrum,
    zipSamplesToSpectrum,
    computeTotalSpectrum
} from './process-samples';

describe('computeSpectrum', () => {
    it('should compute the fft of a 256 samples array', () => {
        const samples = new Array(FFT_BUFFER_SIZE);
        // For a constant signal...
        samples.fill(1);
        
        let spectrum = computeSpectrum(samples);
        expect(spectrum).toHaveLength(128);

        // ... the zero frequency is the greatest
        expect(spectrum[0]).toBeGreaterThan(1);

        // ... and all other are close to 0
        spectrum
            .filter( (d, i) => i > 1 )
            .forEach( (d) => expect(d).toBeLessThan(0.1) );
    });
});

describe('zipSamplesToSpectrum', () => {
    // Per electrode, emit 1 full buffer plus three times 26 samples, to generate 3 spectrums
    const messages_count = Math.ceil((FFT_BUFFER_SIZE + 3 * FFT_WINDOW_OVERLAP) / 12) * 5;
    const sample_messages = new Array(messages_count)
        .fill(undefined)
        .map((d, i): EEGReading => {
            let j = Math.floor(i / 5);
            return {
                electrode: i % 5,
                index: 100 + j,
                timestamp: 1000 + j * 46.875,
                samples: new Array(12).fill(1)
            }
        });
    const sample_input: Observable<EEGReading> = from(sample_messages);

    it('should emit a spectrum for each electrode when 256 samples are recieved and every 26 samples', async () => {
        const zipped = zipSamplesToSpectrum(sample_input);
        const result = await zipped.pipe(toArray()).toPromise();
        expect(result).toHaveLength(3);
        expect(result[0].timestamp).toEqual(1000);
        expect(result[0].data).toHaveLength(5);
        result[0].data.forEach(
            s => s.forEach(
                d => expect(d).not.toBeNaN()
            )
        );
    });
});

describe('computeTotalSpectrum', () => {
    it('should sum the requested band of the spectrums', () => {
        const spectrumByElectrode = {
            timestamp: 12345678,
            data: new Array(4)
                .fill([])
                .map( (d, i) => new Float64Array(128).fill(i))
        };
        const result = computeTotalSpectrum(spectrumByElectrode);
        expect(result.data).toHaveLength(128);
        result.data.forEach( d => expect(d).toEqual(0+1+2+3) );
    })
});

import { Observable } from 'rxjs/Observable';
import { EEGReading } from './muse-interfaces';

import { from } from 'rxjs/observable/from';
import { toArray } from 'rxjs/operators/toArray';

import { computeSpectrum, zipSamplesToSpectrum } from './process-samples';

describe('computeSpectrum', () => {
    it('should compute the fft of a 256 samples array', () => {
        const samples = new Array(256);
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
    const messages_count = Math.floor(256 / 12 * 5) + 1;
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
        }
        );
    const sample_input: Observable<EEGReading> = from(sample_messages);

    it('should emit a spectrum for each electrode when 256 samples are recieved and every 25 samples', async () => {
        const zipped = zipSamplesToSpectrum(sample_input);
        const result = await zipped.pipe(toArray()).toPromise();
        // console.log(result[0])
        expect(result).toHaveLength(1);
    });
});
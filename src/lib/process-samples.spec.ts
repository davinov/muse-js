import { Observable } from 'rxjs/Observable';
import { EEGReading } from './muse-interfaces';

import { from } from 'rxjs/observable/from';
import { toArray } from 'rxjs/operators/toArray';

import {
    FFT_BUFFER_SIZE, FFT_WINDOW_OVERLAP,
    FrequencyBand, EEGTotalSpectrum, EEGSpectrum,

    computeSpectrum,
    zipSamplesToSpectrum,
    computeTotalSpectrum,
    computeAbsolutePowerBand,
    computeAbsolutePowerBands,
    spectrumToAbsolutePowerBands,
    computeRelativePowerBands,
    spectrumToRelativePowerBands,
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
    });
});

describe('computeAbsolutePowerBand', () => {
    it('should sum all the power spectral density of the requested band on a log scale', () => {
        const totalSpectrum: EEGTotalSpectrum = {
            timestamp: 12345678,
            data: new Float64Array(128).fill(0).map((d, i) => i)
        };
        const band: FrequencyBand = {
            id: 'LOW',
            label: 'Low frequencies',
            range: [2.5, 6.1]
        };
        const result = computeAbsolutePowerBand(band, totalSpectrum);
        expect(result.band).toEqual(band);
        expect(result.power).toEqual(Math.log(3 + 4 + 5 + 6));
    });
});

describe('computeAbsolutePowerBands', () => {
    it('should compute the power band for all standard power bands', () => {
        const totalSpectrum: EEGTotalSpectrum = {
            timestamp: 12345678,
            data: new Float64Array(128).fill(0).map((d, i) => i)
        };
        const result = computeAbsolutePowerBands(totalSpectrum);
        expect(result).toHaveLength(5);
        expect(result[0].power).toEqual(Math.log(10));
        expect(result[1].power).toEqual(Math.log(30));
    });
});

const eegSpectrumSampleMessages = new Array(10).fill(undefined)
    .map((_, i) => {
        return {
            timestamp: 12345678,
            data: new Array(4)
                .fill([])
                .map((d, i) => new Float64Array(128).fill(i))
        }
    });
const eegSpectrumSampleInput: Observable<EEGSpectrum> = from(eegSpectrumSampleMessages);

describe('spectrumToAbsolutePowerBands', () => {
    it('should emit an array of absolute band powers each time a spectrum is emitted', async () => {
        const result = await spectrumToAbsolutePowerBands(eegSpectrumSampleInput).pipe(toArray()).toPromise();
        expect(result).toHaveLength(10);
        result.forEach( (r) => {
            expect(r).toHaveLength(5);
        });
    });
});

describe('computeRelativePowerBands', () => {
    it('should sum all the power spectral density of the requested band and compare it to the total of bands', () => {
        const totalSpectrum: EEGTotalSpectrum = {
            timestamp: 12345678,
            data: new Float64Array(128).fill(0).map((d, i) => i)
        };
        const result = computeRelativePowerBands(totalSpectrum);
        expect(result).toHaveLength(5);
        result.forEach( r => {
            expect(r.power).toBeLessThan(1);
            expect(r.power).toBeGreaterThan(0);
        });
    });
});

describe('spectrumToRelativePowerBands', () => {
    it('should emit an array of relative band powers each time a spectrum is emitted', async () => {
        const result = await spectrumToRelativePowerBands(eegSpectrumSampleInput).pipe(toArray()).toPromise();
        expect(result).toHaveLength(10);
        result.forEach((r) => {
            expect(r).toHaveLength(5);
        });
    });
});

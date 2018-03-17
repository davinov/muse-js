import { computeSpectrum } from './signal-processing';

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
import { Observable } from 'rxjs/Observable';
import { EEGReading } from './muse-interfaces';
export declare const FFT_BUFFER_SIZE = 256;
export declare const FFT_WINDOW_OVERLAP = 26;
export declare function computeSpectrum(timeSerie: number[]): Float64Array;
export interface EEGSpectrum {
    timestamp: number;
    data: Float64Array[];
}
export declare function zipSamplesToSpectrum(eggSamples: Observable<EEGReading>): Observable<EEGSpectrum>;
export interface EEGTotalSpectrum {
    timestamp: number;
    data: Float64Array;
}
export declare function computeTotalSpectrum(spectrumByElectrode: EEGSpectrum): EEGTotalSpectrum;
export interface FrequencyBand {
    id: string;
    label: string;
    range: [number, number];
}
export interface EEGAbsolutePowerBand {
    band: FrequencyBand;
    power: number;
}
export declare function computeAbsolutePowerBand(band: FrequencyBand, totalSpectrum: EEGTotalSpectrum): EEGAbsolutePowerBand;
export declare const POWER_BANDS: {
    [index: string]: FrequencyBand;
};
export declare function computeAbsolutePowerBands(totalSpectrum: EEGTotalSpectrum): EEGAbsolutePowerBand[];
export declare function spectrumToAbsolutePowerBands(eggSpectrum: Observable<EEGSpectrum>): Observable<EEGAbsolutePowerBand[]>;
export interface EEGRelativePowerBand {
    band: FrequencyBand;
    power: number;
}
export declare function computeRelativePowerBands(totalSpectrum: EEGTotalSpectrum): EEGRelativePowerBand[];
export declare function spectrumToRelativePowerBands(eggSpectrum: Observable<EEGSpectrum>): Observable<EEGRelativePowerBand[]>;

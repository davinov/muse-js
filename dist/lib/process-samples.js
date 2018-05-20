"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dsp_js_1 = require("dsp.js");
var muse_1 = require("./../muse");
var zip_samples_1 = require("./zip-samples");
var map_1 = require("rxjs/operators/map");
exports.FFT_BUFFER_SIZE = 256;
exports.FFT_WINDOW_OVERLAP = 26;
var fft = new dsp_js_1.RFFT(exports.FFT_BUFFER_SIZE, muse_1.EEG_FREQUENCY);
/*  From an array of measures, apply a Hamming window and a Fast Fourier Transform

    The resulting spectrum contains of 128 frequency bands, the first one
    representing the constant part (0Hz), the next ones having a width of 1Hz.
*/
function computeSpectrum(timeSerie) {
    fft.forward(timeSerie.map(function (v, i) { return dsp_js_1.WindowFunction.Hamming(timeSerie.length, i) * v; }));
    return fft.spectrum;
}
exports.computeSpectrum = computeSpectrum;
function zipSamplesToSpectrum(eggSamples) {
    return zip_samples_1.zipSamplesToTimeSeries(eggSamples, exports.FFT_BUFFER_SIZE, exports.FFT_WINDOW_OVERLAP).pipe(map_1.map(function (eegTimeSeries) {
        return {
            timestamp: eegTimeSeries.timestamp,
            data: eegTimeSeries.data.map(function (d) { return new Float64Array(computeSpectrum(d)); })
        };
    }));
}
exports.zipSamplesToSpectrum = zipSamplesToSpectrum;
function computeTotalSpectrum(spectrumByElectrode) {
    return {
        timestamp: spectrumByElectrode.timestamp,
        data: spectrumByElectrode.data[0].map(function (freqValue, freq) {
            return spectrumByElectrode.data
                .map(function (spectrum) { return spectrum[freq]; })
                .filter(isFinite)
                .reduce(function (sum, v) { return sum + v; }, 0);
        })
    };
}
exports.computeTotalSpectrum = computeTotalSpectrum;
function sumPowerOfBand(band, totalSpectrum) {
    return totalSpectrum.data.reduce(function (totalPower, freqPower, freq) {
        // This is a pretty naive implentation, case of float frequencies should be addressed
        if ((freq >= band.range[0]) && (freq <= band.range[1]) && isFinite(freqPower)) {
            return totalPower + freqPower;
        }
        else {
            return totalPower;
        }
    }, 0);
}
function computeAbsolutePowerBand(band, totalSpectrum) {
    return {
        band: band,
        power: Math.log(sumPowerOfBand(band, totalSpectrum))
    };
}
exports.computeAbsolutePowerBand = computeAbsolutePowerBand;
exports.POWER_BANDS = {
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
function computeAbsolutePowerBands(totalSpectrum) {
    return Object.keys(exports.POWER_BANDS).map(function (k) { return computeAbsolutePowerBand(exports.POWER_BANDS[k], totalSpectrum); });
}
exports.computeAbsolutePowerBands = computeAbsolutePowerBands;
function spectrumToAbsolutePowerBands(eggSpectrum) {
    return eggSpectrum.pipe(map_1.map(function (d) { return computeTotalSpectrum(d); }), map_1.map(function (d) { return computeAbsolutePowerBands(d); }));
}
exports.spectrumToAbsolutePowerBands = spectrumToAbsolutePowerBands;
function computeRelativePowerBands(totalSpectrum) {
    var relativePowerBands = Object.keys(exports.POWER_BANDS).map(function (k) {
        return {
            band: exports.POWER_BANDS[k],
            power: sumPowerOfBand(exports.POWER_BANDS[k], totalSpectrum)
        };
    });
    var totalPowerOfBands = relativePowerBands.reduce(function (total, relativePowerBand) {
        return total + relativePowerBand.power;
    }, 0);
    relativePowerBands.forEach(function (r) {
        r.power /= totalPowerOfBands;
    });
    return relativePowerBands;
}
exports.computeRelativePowerBands = computeRelativePowerBands;
function spectrumToRelativePowerBands(eggSpectrum) {
    return eggSpectrum.pipe(map_1.map(function (d) { return computeTotalSpectrum(d); }), map_1.map(function (d) { return computeRelativePowerBands(d); }));
}
exports.spectrumToRelativePowerBands = spectrumToRelativePowerBands;
//# sourceMappingURL=process-samples.js.map
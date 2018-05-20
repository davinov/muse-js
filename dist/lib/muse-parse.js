"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var concatMap_1 = require("rxjs/operators/concatMap");
var filter_1 = require("rxjs/operators/filter");
var map_1 = require("rxjs/operators/map");
var scan_1 = require("rxjs/operators/scan");
function parseControl(controlData) {
    return controlData.pipe(concatMap_1.concatMap(function (data) { return data.split(''); }), scan_1.scan(function (acc, value) {
        if (acc.indexOf('}') >= 0) {
            return value;
        }
        else {
            return acc + value;
        }
    }, ''), filter_1.filter(function (value) { return value.indexOf('}') >= 0; }), map_1.map(function (value) { return JSON.parse(value); }));
}
exports.parseControl = parseControl;
function decodeUnsigned12BitData(samples) {
    var samples12Bit = [];
    // tslint:disable:no-bitwise
    for (var i = 0; i < samples.length; i++) {
        if (i % 3 === 0) {
            samples12Bit.push(samples[i] << 4 | samples[i + 1] >> 4);
        }
        else {
            samples12Bit.push((samples[i] & 0xf) << 8 | samples[i + 1]);
            i++;
        }
    }
    // tslint:enable:no-bitwise
    return samples12Bit;
}
exports.decodeUnsigned12BitData = decodeUnsigned12BitData;
function decodeEEGSamples(samples) {
    return decodeUnsigned12BitData(samples)
        .map(function (n) { return 0.48828125 * (n - 0x800); });
}
exports.decodeEEGSamples = decodeEEGSamples;
function parseTelemetry(data) {
    // tslint:disable:object-literal-sort-keys
    return {
        sequenceId: data.getUint16(0),
        batteryLevel: data.getUint16(2) / 512.,
        fuelGaugeVoltage: data.getUint16(4) * 2.2,
        // Next 2 bytes are probably ADC millivolt level, not sure
        temperature: data.getUint16(8),
    };
    // tslint:enable:object-literal-sort-keys
}
exports.parseTelemetry = parseTelemetry;
function parseImuReading(data, scale) {
    function sample(startIndex) {
        return {
            x: scale * data.getInt16(startIndex),
            y: scale * data.getInt16(startIndex + 2),
            z: scale * data.getInt16(startIndex + 4),
        };
    }
    // tslint:disable:object-literal-sort-keys
    return {
        sequenceId: data.getUint16(0),
        samples: [sample(2), sample(8), sample(14)],
    };
    // tslint:enable:object-literal-sort-keys
}
function parseAccelerometer(data) {
    return parseImuReading(data, 0.0000610352);
}
exports.parseAccelerometer = parseAccelerometer;
function parseGyroscope(data) {
    return parseImuReading(data, 0.0074768);
}
exports.parseGyroscope = parseGyroscope;
//# sourceMappingURL=muse-parse.js.map
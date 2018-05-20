"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var muse_1 = require("./../muse");
var from_1 = require("rxjs/observable/from");
var concat_1 = require("rxjs/operators/concat");
var mergeMap_1 = require("rxjs/operators/mergeMap");
var bufferCount_1 = require("rxjs/operators/bufferCount");
var map_1 = require("rxjs/operators/map");
var skipLast_1 = require("rxjs/operators/skipLast");
function zipSamples(eegReadings) {
    var buffer = [];
    var lastTimestamp = null;
    return eegReadings.pipe(mergeMap_1.mergeMap(function (reading) {
        if (reading.timestamp !== lastTimestamp) {
            lastTimestamp = reading.timestamp;
            if (buffer.length) {
                var result = from_1.from([buffer.slice()]);
                buffer.splice(0, buffer.length, reading);
                return result;
            }
        }
        buffer.push(reading);
        return from_1.from([]);
    }), concat_1.concat(from_1.from([buffer])), mergeMap_1.mergeMap(function (readings) {
        var result = readings[0].samples.map(function (x, index) {
            var data = [NaN, NaN, NaN, NaN, NaN];
            for (var _i = 0, readings_1 = readings; _i < readings_1.length; _i++) {
                var reading = readings_1[_i];
                data[reading.electrode] = reading.samples[index];
            }
            return {
                data: data,
                index: readings[0].index,
                timestamp: readings[0].timestamp + index * 1000. / muse_1.EEG_FREQUENCY,
            };
        });
        return from_1.from(result);
    }));
}
exports.zipSamples = zipSamples;
function zipSamplesToTimeSeries(eegReadings, bufferSize, bufferOverlap) {
    return zipSamples(eegReadings).pipe(bufferCount_1.bufferCount(bufferSize, bufferOverlap), 
    // skip incomplete readings
    skipLast_1.skipLast(Math.ceil(bufferSize / bufferOverlap)), map_1.map(function (zippedReadings) {
        return {
            timestamp: zippedReadings[0].timestamp,
            data: zippedReadings[0].data.map(function (_, electrodeId) {
                return zippedReadings.map(function (zippedReading) { return zippedReading.data[electrodeId]; });
            })
        };
    }));
}
exports.zipSamplesToTimeSeries = zipSamplesToTimeSeries;
//# sourceMappingURL=zip-samples.js.map
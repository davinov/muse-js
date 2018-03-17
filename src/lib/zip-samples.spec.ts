import { Observable } from 'rxjs/Observable';

import { of } from 'rxjs/observable/of';
import { toArray } from 'rxjs/operators/toArray';

import { zipSamples, zipSamplesToTimeSeries } from './zip-samples';

// tslint:disable:object-literal-sort-keys

const sample_input = of(
    {
        electrode: 2, index: 100, timestamp: 1000,
        samples: [2.01, 2.02, 2.03, 2.04, 2.05, 2.06, 2.07, 2.08, 2.09, 2.10, 2.11, 2.12],
    },
    {
        electrode: 1, index: 100, timestamp: 1000,
        samples: [1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.10, 1.11, 1.12],
    },
    {
        electrode: 4, index: 100, timestamp: 1000,
        samples: [4.01, 4.02, 4.03, 4.04, 4.05, 4.06, 4.07, 4.08, 4.09, 4.10, 4.11, 4.12],
    },
    {
        electrode: 0, index: 100, timestamp: 1000,
        samples: [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12],
    },
    {
        electrode: 3, index: 100, timestamp: 1000,
        samples: [3.01, 3.02, 3.03, 3.04, 3.05, 3.06, 3.07, 3.08, 3.09, 3.10, 3.11, 3.12],
    },
    {
        electrode: 2, index: 101, timestamp: 1046.875,
        samples: [12.01, 12.02, 12.03, 12.04, 12.05, 12.06, 12.07, 12.08, 12.09, 12.10, 12.11, 12.12],
    },
    {
        electrode: 1, index: 101, timestamp: 1046.875,
        samples: [11.01, 11.02, 11.03, 11.04, 11.05, 11.06, 11.07, 11.08, 11.09, 11.10, 11.11, 11.12],
    },
    {
        electrode: 4, index: 101, timestamp: 1046.875,
        samples: [14.01, 14.02, 14.03, 14.04, 14.05, 14.06, 14.07, 14.08, 14.09, 14.10, 14.11, 14.12],
    },
    {
        electrode: 0, index: 101, timestamp: 1046.875,
        samples: [10.01, 10.02, 10.03, 10.04, 10.05, 10.06, 10.07, 10.08, 10.09, 10.10, 10.11, 10.12],
    },
    {
        electrode: 3, index: 101, timestamp: 1046.875,
        samples: [13.01, 13.02, 13.03, 13.04, 13.05, 13.06, 13.07, 13.08, 13.09, 13.10, 13.11, 13.12],
    },
);

describe('zipSamples', () => {
    it('should zip all eeg channels into one array', async () => {
        const zipped = zipSamples(sample_input);
        const result = await zipped.pipe(toArray()).toPromise();
        expect(result).toEqual([
            { index: 100, timestamp: 1000.00000, data: [0.01, 1.01, 2.01, 3.01, 4.01] },
            { index: 100, timestamp: 1003.90625, data: [0.02, 1.02, 2.02, 3.02, 4.02] },
            { index: 100, timestamp: 1007.81250, data: [0.03, 1.03, 2.03, 3.03, 4.03] },
            { index: 100, timestamp: 1011.71875, data: [0.04, 1.04, 2.04, 3.04, 4.04] },
            { index: 100, timestamp: 1015.62500, data: [0.05, 1.05, 2.05, 3.05, 4.05] },
            { index: 100, timestamp: 1019.53125, data: [0.06, 1.06, 2.06, 3.06, 4.06] },
            { index: 100, timestamp: 1023.43750, data: [0.07, 1.07, 2.07, 3.07, 4.07] },
            { index: 100, timestamp: 1027.34375, data: [0.08, 1.08, 2.08, 3.08, 4.08] },
            { index: 100, timestamp: 1031.25000, data: [0.09, 1.09, 2.09, 3.09, 4.09] },
            { index: 100, timestamp: 1035.15625, data: [0.10, 1.10, 2.10, 3.10, 4.10] },
            { index: 100, timestamp: 1039.06250, data: [0.11, 1.11, 2.11, 3.11, 4.11] },
            { index: 100, timestamp: 1042.96875, data: [0.12, 1.12, 2.12, 3.12, 4.12] },
            { index: 101, timestamp: 1046.87500, data: [10.01, 11.01, 12.01, 13.01, 14.01] },
            { index: 101, timestamp: 1050.78125, data: [10.02, 11.02, 12.02, 13.02, 14.02] },
            { index: 101, timestamp: 1054.68750, data: [10.03, 11.03, 12.03, 13.03, 14.03] },
            { index: 101, timestamp: 1058.59375, data: [10.04, 11.04, 12.04, 13.04, 14.04] },
            { index: 101, timestamp: 1062.50000, data: [10.05, 11.05, 12.05, 13.05, 14.05] },
            { index: 101, timestamp: 1066.40625, data: [10.06, 11.06, 12.06, 13.06, 14.06] },
            { index: 101, timestamp: 1070.31250, data: [10.07, 11.07, 12.07, 13.07, 14.07] },
            { index: 101, timestamp: 1074.21875, data: [10.08, 11.08, 12.08, 13.08, 14.08] },
            { index: 101, timestamp: 1078.12500, data: [10.09, 11.09, 12.09, 13.09, 14.09] },
            { index: 101, timestamp: 1082.03125, data: [10.10, 11.10, 12.10, 13.10, 14.10] },
            { index: 101, timestamp: 1085.93750, data: [10.11, 11.11, 12.11, 13.11, 14.11] },
            { index: 101, timestamp: 1089.84375, data: [10.12, 11.12, 12.12, 13.12, 14.12] },
        ]);
    });

    it('should indicate missing samples with NaN', async () => {
        const input = of(
            { index: 50, timestamp: 5000, electrode: 2, samples: [2.01, 2.02, 2.03, 2.04] },
            { index: 50, timestamp: 5000, electrode: 4, samples: [4.01, 4.02, 4.03, 4.04] },
            { index: 50, timestamp: 5000, electrode: 0, samples: [0.01, 0.02, 0.03, 0.04] },
            { index: 50, timestamp: 5000, electrode: 3, samples: [3.01, 3.02, 3.03, 3.04] },
        );
        const zipped = zipSamples(input);
        const result = await zipped.pipe(toArray()).toPromise();
        expect(result).toEqual([
            { index: 50, timestamp: 5000.00000, data: [0.01, NaN, 2.01, 3.01, 4.01] },
            { index: 50, timestamp: 5003.90625, data: [0.02, NaN, 2.02, 3.02, 4.02] },
            { index: 50, timestamp: 5007.81250, data: [0.03, NaN, 2.03, 3.03, 4.03] },
            { index: 50, timestamp: 5011.71875, data: [0.04, NaN, 2.04, 3.04, 4.04] },
        ]);
    });
});

describe('zipSamplesToTimeSeries', () => {
    it('should zip each eeg channels into a time serie', async () => {
        const zipped = zipSamplesToTimeSeries(sample_input, 12, 1);
        const result = await zipped.pipe(toArray()).toPromise();

        expect(result[0]).toEqual({
            timestamp: 1000.00000,
            data: [
                [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12]
            ,
                [1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.10, 1.11, 1.12]
            ,
                [2.01, 2.02, 2.03, 2.04, 2.05, 2.06, 2.07, 2.08, 2.09, 2.10, 2.11, 2.12]
            ,
                [3.01, 3.02, 3.03, 3.04, 3.05, 3.06, 3.07, 3.08, 3.09, 3.10, 3.11, 3.12]
            ,
                [4.01, 4.02, 4.03, 4.04, 4.05, 4.06, 4.07, 4.08, 4.09, 4.10, 4.11, 4.12]
            ]
        });
        expect(result[1]).toEqual({
            timestamp: 1003.90625,
            data: [
                [0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12, 10.01]
            ,
                [1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.10, 1.11, 1.12, 11.01]
            ,
                [2.02, 2.03, 2.04, 2.05, 2.06, 2.07, 2.08, 2.09, 2.10, 2.11, 2.12, 12.01]
            ,
                [3.02, 3.03, 3.04, 3.05, 3.06, 3.07, 3.08, 3.09, 3.10, 3.11, 3.12, 13.01]
            ,
                [4.02, 4.03, 4.04, 4.05, 4.06, 4.07, 4.08, 4.09, 4.10, 4.11, 4.12, 14.01]
            ]
        });
        expect(result).toHaveLength(12);
    });

    it('should never deliver incomplete data', async () => {
        const zipped = zipSamplesToTimeSeries(sample_input, 12, 5);
        const result = await zipped.pipe(toArray()).toPromise();
        result.forEach(d => d.data.forEach(
            e => expect(e).toHaveLength(12)
        ));
        expect(result).toHaveLength(2);
    });
});

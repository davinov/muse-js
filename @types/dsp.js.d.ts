declare module 'dsp.js' {
    class FourierTransform {
        constructor(bufferSize: number, sampleRate: number);

        spectrum: Float64Array;
        forward: (samples: number[]) => void;
    }

    class FFT extends FourierTransform { }

    class RFFT extends FourierTransform { }

    namespace WindowFunction {
        let Hamming: (length: number, index: number) => number;
    }
}

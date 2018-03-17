// tslint:disable:no-console

import { channelNames, EEGReading, MuseClient, EEGSpectrum } from './../../src/muse';

(window as any).connect = async () => {
    const graphTitles = Array.from(document.querySelectorAll('.electrode-item h3'));
    const canvases = {
        readings: (Array.from(document.querySelectorAll('.electrode-item canvas.readings')) as HTMLCanvasElement[]).map(canvas => {
            return {
                canvas: canvas,
                ctx: canvas.getContext('2d')
            }
        }),
        fft: (Array.from(document.querySelectorAll('.electrode-item canvas.fft')) as HTMLCanvasElement[]).map(canvas => {
            return {
                canvas: canvas,
                ctx: canvas.getContext('2d')
            }
        })
    };
    graphTitles.forEach((item, index) => {
        item.textContent = channelNames[index];
    });

    function plotReading(reading: EEGReading) {
        if (!canvases.readings[reading.electrode]) {
            return;
        }
        const canvas = canvases.readings[reading.electrode].canvas;
        const context = canvases.readings[reading.electrode].ctx;
        if (!context) {
            return;
        }
        const width = canvas.width / 12.0;
        const height = canvas.height / 2.0;
        context.fillStyle = 'green';
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < reading.samples.length; i++) {
            const sample = reading.samples[i] / 15.;
            if (sample > 0) {
                context.fillRect(i * 25, height - sample, width, sample);
            } else {
                context.fillRect(i * 25, height, width, -sample);
            }
        }
    }

    function plotFFT(spectrum: EEGSpectrum) {
        spectrum.spectrums.forEach( (s, electrode) => {
            if (!canvases.fft[electrode]) {
                return;
            }
            const canvas = canvases.fft[electrode].canvas;
            const context = canvases.fft[electrode].ctx;
            if (!context) {
                return;
            }
            const width = canvas.width / s.length;
            const height = canvas.height;
            context.fillStyle = 'blue';
            context.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < s.length; i++) {
                const sample = s[i] * height / 2.;
                if (sample > 0) {
                    context.fillRect(i * width, height - sample, width, sample);
                } else {
                    context.fillRect(i * width, height, width, -sample);
                }
            }
        });
    }

    const client = new MuseClient();
    client.connectionStatus.subscribe((status) => {
        console.log(status ? 'Connected!' : 'Disconnected');
    });

    try {
        client.enableAux = false;
        await client.connect();
        await client.start();
        document.getElementById('headset-name')!.innerText = client.deviceName;
        client.eegReadings.subscribe((reading) => {
            plotReading(reading);
        });
        client.rawFFT.subscribe((spectrum) => {
            plotFFT(spectrum);
        });
        client.telemetryData.subscribe((reading) => {
            document.getElementById('temperature')!.innerText = reading.temperature.toString() + '℃';
            document.getElementById('batteryLevel')!.innerText = reading.batteryLevel.toFixed(2) + '%';
        });
        client.accelerometerData.subscribe((accel) => {
            const normalize = (v: number) => (v / 16384.).toFixed(2) + 'g';
            document.getElementById('accelerometer-x')!.innerText = normalize(accel.samples[2].x);
            document.getElementById('accelerometer-y')!.innerText = normalize(accel.samples[2].y);
            document.getElementById('accelerometer-z')!.innerText = normalize(accel.samples[2].z);
        });
        await client.deviceInfo().then((deviceInfo) => {
            document.getElementById('hardware-version')!.innerText = deviceInfo.hw;
            document.getElementById('firmware-version')!.innerText = deviceInfo.fw;
        });
    } catch (err) {
        console.error('Connection failed', err);
    }
};

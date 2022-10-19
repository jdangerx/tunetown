const TEMPO = 120;

let TONE_STARTED = false;

const track = [
    { note: "E4", time: "0:0:0", duration: "2n" },
    { note: "D4", time: "0:2:0", duration: "2n" },
    { note: "C4", time: "1:0:0", duration: "1n" },
    { note: "E4", time: "2:0:0", duration: "2n" },
    { note: "D4", time: "2:2:0", duration: "2n" },
    { note: "C4", time: "3:0:0", duration: "1n" },
    { note: "C4", time: "4:0:0", duration: "8n" },
    { note: "C4", time: "4:0:2", duration: "8n" },
    { note: "C4", time: "4:1:0", duration: "8n" },
    { note: "C4", time: "4:1:2", duration: "8n" },
    { note: "D4", time: "4:2:0", duration: "8n" },
    { note: "D4", time: "4:2:2", duration: "8n" },
    { note: "D4", time: "4:3:0", duration: "8n" },
    { note: "D4", time: "4:3:2", duration: "8n" },
    { note: "E4", time: "5:0:0", duration: "2n" },
    { note: "D4", time: "5:2:0", duration: "2n" },
    { note: "C4", time: "6:0:0", duration: "1n" },
];

document.addEventListener('click', async () => {
    if (TONE_STARTED) {
        return;
    }
    await Tone.start();
    console.log('Tone.js started.');
    TONE_STARTED = true;
});

function setup() {
    const sequencer = document.querySelector("div.sequencer");
    const button = document.createElement("button");
    button.innerHTML = "play";
    sequencer.appendChild(button);
    const pos = document.createElement("div");
    sequencer.appendChild(pos);
    button.onclick = toggle;

    const synth = new Tone.Synth().toDestination();


    track.forEach(({ note, time, duration }) => {
        Tone.Transport.schedule(
            _time => synth.triggerAttackRelease(note, duration),
            time
        )
    });

    const loop = new Tone.Loop(cursor => {
        pos.innerHTML = Tone.Transport.position;
    }, "16n").start(0);


    Tone.Transport.loop = true;
    Tone.Transport.loopStart = "0:0:0";
    Tone.Transport.loopEnd = "7:0:0";
}

function toggle() {
    if (Tone.Transport.state === "stopped") {
        console.log(Tone.Transport.state, 'starting');
        Tone.Transport.start();
    } else {
        console.log(Tone.Transport.state, 'stopping');
        Tone.Transport.stop();
    }
}

window.onload = setup;
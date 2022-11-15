import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Tone from 'tone';
import './index.css';

function Note(props) {
    const PIXELS_PER_GRID = 29;
    const actualGridSize = PIXELS_PER_GRID - 1;
    const [measures, beats, sixteenths] = props.time.split(":").map(x => parseInt(x, 10))
    const duration = 1 / (props.duration.split("n")[0] | 0) * 16;
    // todo: dynamically generate width
    const style = {
        top: "0px",
        left: `${(measures * 16 + beats * 4 + sixteenths) * actualGridSize}px`,
        width: `${duration * actualGridSize}px`,
        overflow: 'visible',
        boxSizing: 'border-box',
        margin: 0,
        background: 'rgba(200, 160, 140, 0.5)',
        border: '2px solid white',
        height: `${actualGridSize}px`
    };
    return <div className="note" style={style} onDoubleClick={() => props.removeNote(props.note, props.time, props.duration)}>
        {props.note}
    </div>
}


function TimeRow(props) {
    const grid = Array(props.count).fill(null).map(
        (_, index) => <TimeCell
            key={index} createNote={props.createNote} step={index} note={props.note} active={index === props.transportStep}
        />
    )
    return <div className="timeRow">
        {grid}
    </div>
}

function TimeCell(props) {
    const classNames = ["timeCell"]
    if (props.active) {
        classNames.push("active")
    }
    if (props.step % 4 === 0) {
        classNames.push("beat")
    }
    return <button
        className={classNames.join(" ")} onClick={() => props.createNote(props.note, props.step)} >
    </button >
}

function NoteRow(props) {
    const notes = props.notes.map(
        ({ note, time, duration }, index) => <Note
            key={index}
            note={note}
            time={time}
            duration={duration}
            removeNote={props.removeNote}
        />
    )
    return <div className="noteRow">
        <TimeRow
            key={props.note}
            transportStep={props.transportStep}
            count={32}
            createNote={props.createNote}
            note={props.note}
        />
        {notes}
    </div>
}

function Track(props) {
    const allNotes = ["A3", "B3", "C4", "D4", "E4", "F4", "G4"].reverse();
    const noteRows = allNotes.map(
        (note) => <NoteRow key={note}
            transportStep={props.transportStep}
            note={note}
            notes={props.notes.filter(n => n.note === note)}
            createNote={props.createNote}
            removeNote={props.removeNote}
        />
    )

    return <div className="track">
        {noteRows}
    </div>

}

function Transport(props) {
    return <div className="transport">
        <PlayStop handleClick={props.handleClick} transportState={props.transportState} />
        <Position transportPosition={props.transportPosition} />
    </div>
}

function PlayStop(props) {
    return <span className="playStop" onClick={props.handleClick}>
        {props.transportState === "stopped" ? "▶" : "⬛"}
    </span>
}

function Position(props) {
    return <span className="position">|{props.transportPosition}</span>
}

function Arrangement(props) {
    return <div className="arrangement">
        <Track
            notes={props.notes}
            transportStep={props.transportStep}
            createNote={props.createNote}
            removeNote={props.removeNote} />
    </div>
}


class DAW extends React.Component {
    constructor(props) {
        super(props);

        const synth = new Tone.Synth().toDestination();

        Tone.Transport.loop = true;
        Tone.Transport.loopStart = "0:0:0";
        Tone.Transport.loopEnd = "2:0:0";
        this.state = {
            toneStarted: false,
            transportState: "stopped",
            transportPosition: "   1:   1:   1",
            transportStep: 0,
            transport: Tone.Transport,
            notes: [
                { note: "D4", time: "0:2:1", duration: "8n" }
            ],
            synth: synth,
        }
    }

    async handleTransportClick() {
        if (!this.state.toneStarted) {
            await Tone.start();
            this.setState({ toneStarted: true });
            console.log('Tone.js started');
        }
        this.resetNoteEvents();

        Tone.Transport.scheduleRepeat((time) => {
            const [measure, beat, sixteenth] = Tone.Transport.position
                .split(".")[0]
                .split(":")
                .map(x => parseInt(x, 10));

            const format = x => String(x + 1).padStart(4, ' ');

            const position = `${format(measure)}:${format(beat)}:${format(sixteenth)}`;
            this.setState({ transportPosition: position, transportStep: measure * 16 + beat * 4 + sixteenth })
        }, "16n")
        this.toggleState();
    }


    resetNoteEvents() {
        console.log("resetting note events");
        if (this.state.events !== undefined) {
            console.log("deleting stuff", this.state.events);
            this.state.events.forEach((id) => Tone.Transport.clear(id));
        }
        const events = this.state.notes.map(({ note, time, duration }) =>
            Tone.Transport.schedule(
                _time => this.state.synth.triggerAttackRelease(note, duration),
                time
            )
        );
        console.log(events);
        this.setState({ events });
    }

    toggleState() {
        switch (this.state.transportState) {
            case "stopped":
                Tone.Transport.start();
                break;
            case "started":
                Tone.Transport.stop();
                break;
            default:
                break;
        }
        this.setState({ transportState: Tone.Transport.state })
    }

    createNote(note, step) {
        const bars = step / 16 | 0;
        const beats = (step % 16) / 4 | 0;
        const sixteenths = (step % 4) | 0;
        const time = `${bars}:${beats}:${sixteenths}`;
        const notes = this.state.notes;
        const duration = "8n"
        notes.push({
            note,
            time,
            duration
        });
        this.setState({ notes }, () => this.resetNoteEvents());
        console.log(note, step, time);
    }

    removeNote(note, time, duration) {
        const notes = this.state.notes;
        const filtered = notes.filter(({ note: n, time: t, duration: d }) => {
            return (note !== n) || (time !== t) || (duration !== d)
        });
        this.setState({ notes: filtered }, () => this.resetNoteEvents());
    }

    spaceToggle(e) {
        if (e.key === " ") {
            this.handleTransportClick();
        }
    }

    componentDidMount() {
        window.addEventListener("keydown", (e) => this.spaceToggle(e));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", (e) => this.spaceToggle(e))

    }

    render() {
        return <div className="daw" onKeyPress={(e) => console.log(`key is ${e.key}`)}>
            <Transport
                handleClick={() => this.handleTransportClick()}
                transportState={this.state.transportState}
                transportPosition={this.state.transportPosition}
            />
            <Arrangement
                transportStep={this.state.transportStep}
                notes={this.state.notes}
                createNote={(note, step) => this.createNote(note, step)}
                removeNote={(note, time, duration) => this.removeNote(note, time, duration)}
            />
        </div>
    }

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<DAW />)
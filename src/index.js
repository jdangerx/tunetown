import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Note(props) {
    const PIXELS_PER_GRID = 29;
    const actualGridSize = PIXELS_PER_GRID - 1;
    const [measures, beats, sixteenths] = props.start.split(":").map(x => x | 0)
    const duration = 1 / (props.gate.split("n")[0] | 0) * 16;
    console.log(duration);
    // todo: dynamically generate width
    const style = {
        top: "3px",
        left: `${(measures * 16 + beats * 4 + sixteenths) * actualGridSize + 1}px`,
        width: `${duration * actualGridSize - 3}px`,
        overflow: 'visible',
        boxSizing: 'border-box',
        margin: 0,
        background: 'rgba(200, 160, 140, 0.5)',
        height: `${actualGridSize - 3}px`
    };
    return <div className="note" style={style}>
        {props.note} {props.start} {props.gate}
    </div>
}

function NoteGrid(props) {
    const grid = Array(props.count).fill(null).map(
        (_, index) => {
            const style = { borderLeft: index % 4 === 0 ? "1px solid #999" : "1px dashed #999" };
            return < button key={index} style={style} className="gridCell" >
            </button >
        }
    )
    return <div className="noteGrid">
        {grid}
    </div>
}

function NoteRow(props) {
    const notes = props.notes.map(
        ({ note, start, gate }) => <Note key={start} note={note} start={start} gate={gate} />
    )
    const grid = <NoteGrid count={32} />;
    return <div className="noteRow">
        {grid}
        {notes}
    </div>
}

function Track(props) {
    const allNotes = ["A4", "B4", "C4", "D4", "E4", "F4", "G4"].reverse();
    // const allNotes = ["G4"].reverse();
    const noteRows = allNotes.map(
        (note) => <NoteRow key={note} notes={props.notes.filter(n => n.note === note)} />
    )

    return <div className="track">
        {noteRows}
    </div>

}

function Transport(props) {
    return <div className="transport">
        Transport
    </div>
}

function Arrangement(props) {
    return <div className="arrangement">
        <Track notes={props.notes} />
    </div>
}


class DAW extends React.Component {
    render() {
        const notes = [
            { note: "G4", start: "0:0:0", gate: "4n" },
            { note: "D4", start: "0:1:0", gate: "4n" },
            { note: "G4", start: "0:2:0", gate: "2n" },
            { note: "G4", start: "1:0:0", gate: "4n" },
            { note: "D4", start: "1:1:0", gate: "4n" },
            { note: "G4", start: "1:2:0", gate: "2n" },
        ];
        return <div className="daw">
            <Transport />
            <Arrangement notes={notes} />
        </div>
    }

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<DAW />)
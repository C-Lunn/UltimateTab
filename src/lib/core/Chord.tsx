const notes = {
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11
};

function to_note_index(note: keyof typeof notes): number {
    if (note in notes) {
        return notes[note];
    } else {
        throw new Error(`Invalid note: ${note}`);
    }
}

function from_note_index(index: number, use_flat = false): string {
    const possible_notes = Object.entries(notes).filter(([, value]) => value === index).map(([key]) => key);
    return use_flat ? possible_notes[1] : possible_notes[0];
}


const chord_regex = /([A-G](?:#|b)?)/;

export function negative_modulo(m: number, n: number): number {
    return ((m % n) + n) % n;
}

export class TabChord {
    public base_note: number;
    public extension: string;

    public constructor(base_note: number, extension: string, capo = 0) {
        this.base_note = (base_note + capo) % 12;
        this.extension = extension;
    }

    public static fromString(chord: string, capo: number = 0): TabChord {
        const matches = chord.match(chord_regex);
        if (matches === null) {
            throw new Error(`Invalid chord: ${chord}`);
        }
        const base_note = to_note_index(matches[1] as keyof typeof notes);
        const extension = chord.slice(matches[1].length);
        return new TabChord(base_note, extension, capo);
    }

    public toString(transpose = 0, use_flat = false): string {
        return from_note_index(negative_modulo(this.base_note + transpose, 12), use_flat) + this.extension;
    }

}


const Chord = (params: { chord: TabChord, transpose: number, use_flat: boolean }) => {
    return (
        <span>
        { params.chord.toString(params.transpose, params.use_flat) }
        </span>
    );
}

export default Chord;
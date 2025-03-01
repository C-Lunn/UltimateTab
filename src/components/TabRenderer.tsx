import Chord, { TabChord } from "../lib/core/Chord";
import { TabSheet } from "../lib/core/TabSheet";
import type { TabGroup, TabSection, Line } from "../lib/core/TabSheet";


export default function TabRenderer({ tab, transpose }: {
    tab: TabSheet,
    transpose: number
}): JSX.Element {
    const ret = [];
    let i = 0;

    function Section({ groups }: { groups: TabGroup[] }): JSX.Element {
        const ret = []
        let i = 0;
        for (const group of groups) {
            ret.push(<Group lines={group} key={`group-${i++}`} />)
        }
        return (<div className="tabrender-section">
            {ret}
        </div>);

    }

    function Group({ lines }: { lines: Line[] }): JSX.Element {
        let i = 0;
        const ret = [];
        for (const line of lines) {
            for (const part of line) {
                if (typeof part === 'string') {
                    ret.push(<span key={`line-${i++}`}>{part}</span>);
                } else {
                    const asTabChord = TabChord.fromNextObj(part)
                    ret.push(<Chord chord={asTabChord} use_flat={false} transpose={transpose} key={`chord-${i++}`} />)
                }
            }
        }
        return (<div className="tabrender-group">
            {ret}
        </div>);
    }

    for (const section of tab) {
        ret.push(<Section groups={section} key={`section-${i++}`} />)
    }


    return (<pre className="tabrender" style={{ width: '100%', minWidth: 'fit-content' }}>
        {ret}
    </pre>);
}


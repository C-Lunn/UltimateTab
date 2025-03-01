import { TabChord } from "./Chord";

type Line = Array<TabChord | string>;
type TabGroup = Array<Line>;
type TabSection = Array<TabGroup>;
type TabSheet = Array<TabSection>;

// exclude / from regex 
const section_header_regex = /^\[[a-zA-Z ]+\]$/

function ParseUGTab(tab_in: string): TabSheet {
    tab_in = tab_in.replaceAll("\n\n", "\n");
    tab_in = tab_in.replaceAll("\r", "");

    const tab_sheet: TabSheet = [];
    let current_section: TabSection = [];
    let current_group: TabGroup = [];
    let current_line: Line = [];

    let in_tab = false;
    let ct = 7;

    const tab_lines = tab_in.split("\n");

    for (const line of tab_lines) {
        ct++;
        current_line = [];

        if (!in_tab) {
            current_section.push(current_group);
            current_group = [];
        }
        // Check if this line is a section header
        const section_header = line.match(section_header_regex);
        if (section_header !== null) {
            if (in_tab) {
                throw new Error("Section header found inside tab");
            }
            tab_sheet.push(current_section);
            current_section = [];
            current_group = [[line]];
            current_line = [];
            continue;
        }

        // iterate through the line
        for (let i = 0; i <= line.length;) {
            if (i === line.length) {
                // End of line
                current_group.push(current_line);
                break;
            }
            const char = line[i];
            let ignore_this_tag = false;

            if (char === "[") {
                // Start of a tag
                const tag = line.slice(i + 1, line.indexOf("]", i));

                switch (tag) {
                    case "tab":
                        if (in_tab) {
                            throw new Error("Nested tab tags are not supported");
                        }
                        in_tab = true;
                        i += tag.length + 2;
                        continue;
                    case "/tab":
                        if (!in_tab) {
                            throw new Error("Mismatched closing tab tag");
                        }
                        in_tab = false;
                        // assume for now that [/tab] will always close a line
                        current_group.push(current_line);
                        current_line = [];
                        current_section.push(current_group);
                        current_group = [];
                        i += tag.length + 2;
                        continue;
                    case "ch":

                        const chord_end = line.indexOf("[/ch]", i);

                        if (chord_end === -1) {
                            throw new Error("Unclosed chord tag");
                        }
                        const chord = line.slice(i + tag.length + 2, chord_end);
                        current_line.push(TabChord.fromString(chord));
                        i = chord_end + 5;
                        continue;
                    default:
                        ignore_this_tag = true;
                        break;
                }
            }

            // coalesce until next [ or EOL
            const next_tag = line.indexOf("[", ignore_this_tag ? i + 1 : i);
            const next_char = next_tag === -1 ? line.length : next_tag;
            current_line.push(line.slice(i, next_char));
            i = next_char;
        }
        // add a <br> to the end of each line
        current_line.push("\n");
    }
    if (current_section.length > 0) {
        tab_sheet.push(current_section);
    }
    return tab_sheet;
}

export type { TabSheet, TabSection, TabGroup, Line };
export { ParseUGTab };
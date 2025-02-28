import { TabChord } from "./Chord";

type Line = Array<TabChord | string>;
type TabGroup = Array<Line>;
type TabSection = Array<TabGroup>;
type TabSheet = Array<TabSection>;

const con10t = `           *Stuck In The Middle With You (Gerry Rafferty, Joe Egan)*





Chords for Intro (probably played on a guitar with double

drop D tuning, arranged for standard)

D       x(0)077x

D7sus2  x(0)055x

D6      x(0)043x

D7      x(0)021x

D6*     x(0)020x

D5      x(0)023x



End of Bridge

D         xx0232 or xx0775

Am7add11  x05530 or x00010 or x00553





[Intro]



[ch]D[/ch]   [ch]D7sus2[/ch] [ch]D6[/ch]  [ch]D7[/ch]     [ch]D6[/ch]* [ch]D7[/ch]  [ch]D5[/ch]

[ch]D[/ch]   [ch]D7sus2[/ch] [ch]D6[/ch]  [ch]D7[/ch]     [ch]D6[/ch]* [ch]D7[/ch]





[Verse]



[tab]        [ch]D[/ch]

Well, I don't know why I came here tonight[/tab]

[tab]          [ch]D[/ch]

I got the feeling that something ain't right[/tab]

[tab]       [ch]G7[/ch]

I'm so scared in case I fall off my chair[/tab]

[tab]        [ch]D[/ch]

And I'm wondering how I'll get down the stairs[/tab]





[Chorus]



[tab][ch]A[/ch]

Clowns to the left of me,[/tab]

[tab][ch]C[/ch]             [ch]G[/ch]             [ch]D[/ch]

Jokers to the right, here I am,[/tab]



Stuck in the middle with you.





[Verse]



[tab]        [ch]D[/ch]

Yes I'm   stuck in the middle with you[/tab]

[tab]        [ch]D[/ch]

And I'm wondering what it is I should do[/tab]

[tab]        [ch]G7[/ch]

It's so hard to keep this smile from my face[/tab]

[tab]          [ch]D[/ch]

Losing control, yeah, I'm all over the place[/tab]





[Chorus]



[tab][ch]A[/ch]

Clowns to the left of me,[/tab]

[tab][ch]C[/ch]             [ch]G[/ch]             [ch]D[/ch]

Jokers to the right, here I am,[/tab]



Stuck in the middle with you.





[Bridge]



[tab]          [ch]G7[/ch]

Well, you started out with nothing,[/tab]

[tab]                                              [ch]D[/ch]

And you're proud that you're a self made man[/tab]

[tab]         [ch]G7[/ch]

And your friends, they all come crawlin', slap you on the back and say,[/tab]

[tab][ch]D[/ch]          [ch]Am7add11[/ch]

Please.... Please.....[/tab]





[tab][Slide Guitar]

[ch]D[/ch]

e|---------5--------------5--------------5--------------5-----|

B|-7----7-------5--7\\5/7---------7----7-------5-\\5/7--------|

G|-7----7------------------------7----7-----------------------|

D|------------------------------------------------------------|

A|------------------------------------------------------------|

E|------------------------------------------------------------|[/tab]





[Verse]



[tab][ch]D[/ch]

Trying to make some sense of it all[/tab]

[tab]          [ch]D[/ch]

But I can see that it makes no sense at all[/tab]

[tab]      [ch]G7[/ch]

Is it cool to go to sleep on the floor[/tab]

[tab]               [ch]D[/ch]

'Cause I don't think that I can take anymore[/tab]





[Chorus]



[tab][ch]A[/ch]

Clowns to the left of me,[/tab]

[tab][ch]C[/ch]             [ch]G[/ch]             [ch]D[/ch]

Jokers to the right, here I am,[/tab]



Stuck in the middle with you.





[Solo]

[ch]D[/ch]       [ch]D[/ch]       [ch]G7[/ch]       [ch]D[/ch]

[ch]A[/ch]   [ch]C[/ch] [ch]G[/ch] [ch]D[/ch]





[Bridge]



[tab]          [ch]G7[/ch]

Well, you started out with nothing,[/tab]

[tab]                                              [ch]D[/ch]

And you're proud that you're a self made man[/tab]

[tab]         [ch]G7[/ch]

And your friends, they all come crawlin', slap you on the back and say,[/tab]

[tab][ch]D[/ch]          [ch]Am7add11[/ch]

Please.... Please.....[/tab]





[Verse]



[tab]        [ch]D[/ch]

Well, I don't know why I came here tonight[/tab]

[tab]          [ch]D[/ch]

I got the feeling that something ain't right[/tab]

[tab]       [ch]G7[/ch]

I'm so scared in case I fall off my chair[/tab]

[tab]        [ch]D[/ch]

And I'm wondering how I'll get down the stairs[/tab]





[Chorus]



[tab][ch]A[/ch]

Clowns to the left of me,[/tab]

[tab][ch]C[/ch]             [ch]G[/ch]             [ch]D[/ch]

Jokers to the right, here I am,[/tab]



Stuck in the middle with you.

[tab]        [ch]D[/ch]

Yes I'm   stuck in the middle with you,[/tab]

[tab][ch]D[/ch]

Stuck in the middle with you.[/tab]

[tab]       [ch]D[/ch]

Here I am, stuck in the middle with you.[/tab]



[tab]e|-2--2--------|

B|-3--3--------|

G|-2--2--------|

D|-0--0--------|

A|-------------|

E|-------------|[/tab]
`
// exclude / from regex 
const section_header_regex = /^\[[a-zA-Z ]+\]$/

function ParseUGTab(tab_in: string): TabSheet {
    tab_in = con10t;

    tab_in.replaceAll("\n\n", "\n");

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
            console.log("Section header found at line", ct, section_header);
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

            console.log(line.slice(i));
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
                        console.log("Tab open at line", ct);
                        i += tag.length + 2;
                        continue;
                    case "/tab":
                        console.log("Tab close at line", ct);
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
                        const chord = line.slice(i + tag.length + 1, chord_end);
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



    }


    return tab_sheet;

}

export type { TabSheet, TabSection, TabGroup, Line };
export { ParseUGTab };
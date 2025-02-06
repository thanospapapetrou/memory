const COLORS = ['red', 'pink', 'orange', 'yellow', 'purple', 'green', 'blue', 'brown',
        'gray', 'lime', 'teal', 'navy', 'silver', 'aqua', 'violet', 'magenta',
        'gold', 'coral', 'salmon', 'crimson', 'khaki', 'olive', 'indigo', 'maroon'];
COLORS[-1] = 'white';
const CONTENTS = [
        ['🛼', '🛴', '🛹', '🚲', '🛵', '🚗', '🚙', '🚕',
        '🛻', '🚌', '🚑', '🚓', '🚚', '🚛', '🚜', '🚂',
        '🚣', '🛶', '🚤', '🚢', '🚁', '🛷', '🚀', '🛸'],
        ['🐕', '🐈', '🐓', '🐑', '🐐', '🐖', '🐄', '🐎',
         '🐇', '🐁', '🐌', '🐢', '🐪', '🐒', '🐅', '🐆',
         '🐘', '🐍', '🐊', '🐟', '🐙', '🐬', '🐋', '🐧'],
         ['🍌', '🍎', '🍐', '🍓', '🍒', '🍉', '🍍', '🍑',
         '🍋', '🍅', '🍞', '🍖', '🍗', '🍝', '🍟', '🍕',
         '🌭', '🍔', '🍪', '🍩', '🍨', '🍫', '🍰', '🍭']];
CONTENTS[-1] = '❓';
const CURSOR_DISABLED = 'not-allowed';
const CURSOR_ENABLED = 'pointer';
const DELAY = 1000;
const ELEMENT_TD = 'td';
const ELEMENT_TR = 'tr';
const FORMAT_COUNTER = (found, pairs) => `${found}/${pairs}`;
const FORMAT_TIMER = (minutes, seconds) => `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
const ID_COUNTER = 'counter';
const ID_MEMORY = 'memory';
const ID_PARAMETERS = 'parameters';
const ID_TIMER = 'timer';
const MESSAGE_WELL_DONE = 'Well done!'
const MS_PER_S = 1000;
const PARAMETER_THEME = 'theme';
const PARAMETER_DELAY = 'delay';
const PARAMETER_PAIRS = 'pairs';
const S_PER_MIN = 60;

function main() {
    const parameters = new URLSearchParams(window.location.search);
    if (parameters.has(PARAMETER_THEME) && parameters.has(PARAMETER_PAIRS)
            && parameters.has(PARAMETER_DELAY)) {
        document.getElementById(ID_PARAMETERS).style.display = 'none';
        const theme = parseInt(parameters.get(PARAMETER_THEME));
        const pairs = parseInt(parameters.get(PARAMETER_PAIRS));
        const delay = parseInt(parameters.get(PARAMETER_DELAY));
        const rows = Math.floor(Math.sqrt(2 * pairs));
        const columns = Math.ceil(2 * pairs / rows);
        const hash = [...Array(2 * pairs).keys()].map((n) => n % pairs);
        shuffle(hash);
        const memory = document.getElementById(ID_MEMORY);
        memory.found = 0;
        memory.open = null;
        memory.show = function (cell) {
            cell.disable();
            cell.setContent(cell.content, cell.color);
            if (this.open === null) {
                this.open = cell;
            } else if (cell.content == this.open.content) {
                this.open.found = true;
                cell.found = true;
                this.found++;
                this.open = null;
                counter.update(this.found, pairs);
                if (this.found == pairs) {
                    clearInterval(this.clock);
                    alert(MESSAGE_WELL_DONE);
                }
            } else {
                this.disable();
                setTimeout(() => {
                    this.open.setContent(CONTENTS[-1], COLORS[-1]);
                    cell.setContent(CONTENTS[-1], COLORS[-1]);
                    this.enable();
                    this.open = null;
                }, delay);
            }
        };
        memory.enable = function () {
            for (const row of this.children) {
                for (const cell of row.children) {
                    cell.found || cell.enable();
                }
            }
        };
        memory.disable = function () {
            for (const row of this.children) {
                for (const cell of row.children) {
                    cell.disable();
                }
            }
        };
        for (let i = 0; i < rows; i++) {
            const row = document.createElement(ELEMENT_TR);
            for (let j = 0; (j < columns) && (j < 2 * pairs - i * columns); j++) {
                const cell = document.createElement(ELEMENT_TD);
                cell.content = CONTENTS[theme][hash[i * columns + j] % CONTENTS[theme].length];
                cell.color = COLORS[hash[i * columns + j] % COLORS.length];
                cell.found = false;
                cell.setContent = function (content, color) {
                    this.firstChild && this.removeChild(this.firstChild);
                    this.appendChild(document.createTextNode(content));
                    this.style.backgroundColor = color;
                };
                cell.enable = function () {
                    this.style.cursor = CURSOR_ENABLED;
                    this.onclick = () => memory.show(this);
                };
                cell.disable = function () {
                    this.onclick = null;
                    this.style.cursor = CURSOR_DISABLED;
                }
                cell.setContent(CONTENTS[-1], COLORS[-1]);
                row.appendChild(cell);
                cell.enable();
            }
            memory.appendChild(row);
        }
        const counter = document.getElementById(ID_COUNTER);
        counter.update = function (found, pairs) {
            this.firstChild && this.removeChild(this.firstChild);
            this.appendChild(document.createTextNode(FORMAT_COUNTER(found, pairs)));
        };
        counter.update(memory.found, pairs);
        const timer = document.getElementById(ID_TIMER);
        timer.update = function () {
            this.firstChild && this.removeChild(this.firstChild);
            const seconds = Math.floor((new Date() - this.start) / MS_PER_S);
            this.appendChild(document.createTextNode(FORMAT_TIMER(Math.floor(seconds / S_PER_MIN), seconds % S_PER_MIN)));
        };
        timer.start = new Date();
        timer.update();
        memory.clock = setInterval(() => {
            timer.update();
        }, MS_PER_S);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
     }
}

const LINE_HEIGHT = parseInt(getComputedStyle(document.querySelector("#main"))['line-height'].replace('px', ''))

class Highlight {
    constructor(spans) {
        this.spans = spans;

        this.spans.forEach(s => {
            s.addEventListener('click', e => {
                this.show_ui();
            })
        })
    }

    show_ui() {
        let ui = document.querySelector("#highlight-ui");
        // set context for ui
        let buttons = ui.getElementsByTagName('button')

        // delete button
        buttons[0].onclick = () => {
            ui.hidden = true;
            this.remove_highlight();
        }
        ui.hidden = false;
    }

    remove_highlight() {
        this.spans.forEach(s => {
            if(s.previousSibling != null && s.previousSibling.nodeType === 3)
                s.previousSibling.data += s.innerText;
            else
                s.insertAdjacentText('beforebegin', s.innerText);

            if (s.nextSibling != null && s.nextSibling.nodeType === 3) {
                s.previousSibling.data += s.nextSibling.data;
                s.parentNode.removeChild(s.nextSibling);
            }

            s.parentNode.removeChild(s);
        })
    }

    static _createSpan(t, index, length) {
        let span = document.createElement('span');
        span.classList.add('highlight', 'noselect');
        span.innerText = t.data.substr(index, length);

        return span;
    }

    static fromSelection(sel) {
        let spans = [];

        for (let i=0; i<sel.rangeCount; ++i) {
            let r = sel.getRangeAt(i);
            let start = r.startContainer;
            let end = r.endContainer;

            if (start.nodeType === 1)
                start = start.childNodes[0];

            if (start == end) {
                let s = Highlight._createSpan(start,
                                              r.startOffset,
                                              r.endOffset-r.startOffset);

                end = start.data.substr(r.endOffset, start.data.length);
                start.data = start.data.substr(0, r.startOffset);
                start.parentNode.insertBefore(s, start.nextSibling);
                s.insertAdjacentText('afterend', end);
                spans.push(s);
            } else {
                let s = Highlight._createSpan(start,
                                              r.startOffset,
                                              start.data.length);

                start.data = start.data.substr(0, r.startOffset);
                start.parentNode.insertBefore(s, start.nextSibling);
                spans.push(s);

                if (end.nodeType == 3) {
                    s = Highlight._createSpan(end, 0,
                                              r.endOffset);

                    end.data = end.data.substr(r.endOffset, end.data.length);
                    end.parentNode.insertBefore(s, end);
                    spans.push(s);
                }
            }
        }
        return new Highlight(spans);
    }
}

class ContextUIElement extends HTMLDivElement {
    connectedCallback() {
        this.classList.add('noselect', 'context-ui');
        this.hidden = true;
    }

    show(range) {
        this.hidden = false;

        this.style.left = `${range.x+window.pageXOffset}px`;
        this.style.top = `${range.y+window.pageYOffset+LINE_HEIGHT}px`;
    }

    hide() {
        this.hidden = true;
    }
}
customElements.define('context-ui', ContextUIElement, {extends: 'div'})

document.addEventListener('mouseup', e => {
    let sel = document.getSelection();
    
    if(sel.isCollapsed) {
        document.querySelector("#selection-ui").hide();
        return;
    }

    let r = sel.getRangeAt(sel.rangeCount-1);
    r = r.getClientRects();
    r = r[r.length-1];

    document.querySelector("#selection-ui").show(r);
});

function createHighlight(type) {
    let sel = document.getSelection();

    if (sel.isCollapsed)
        return;

    let highlight = Highlight.fromSelection(sel);


    // add menu
    //createHighlightMenu(sel.getRangeAt(0).getClientRects()[0].y);
    //

    document.querySelector("#selection-ui").hide();
    sel.empty();
}

function createHighlightMenu(highlightY) {
    let root = document.createElement('div');
    root.classList.add('noselect', 'context-ui');

    root.innerHTML = `<button>Delete</button>`;

    root.style.top = `${highlightY + window.pageYOffset}px`;
    root.style.left = `80vw`;

    document.body.append(root);
    return root;
}

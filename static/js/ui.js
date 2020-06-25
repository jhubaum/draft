const LINE_HEIGHT = parseInt(getComputedStyle(document.querySelector("#main"))['line-height'].replace('px', ''))

class Highlight {
    constructor(text, start, length) {
        this.span = document.createElement('span');
        this.span.classList.add('highlight', 'noselect');
        this.span.innerText = text.data.substr(start, length);

        this.span.addEventListener('click', e => {
            this.show_ui();
        })

        let end = text.data.substr(start+length, text.data.length);
        text.data = text.data.substr(0, start);
        text.parentNode.insertBefore(this.span, text.nextSibling);
        this.span.insertAdjacentText('afterend', end);

        // send it to db
        fetch('/1/highlight/add', {
            method: "POST",
             headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
             },
            body: JSON.stringify({
                p: text.parentNode.getAttribute('id'),
                start: start,
                length: length,
            })
        });
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
        if(this.span.previousSibling != null &&
           this.span.previousSibling.nodeType === 3)
                this.span.previousSibling.data += this.span.innerText;
        else
            this.span.insertAdjacentText('beforebegin', this.span.innerText);

        if (this.span.nextSibling != null &&
            this.span.nextSibling.nodeType === 3) {
            this.span.previousSibling.data += this.span.nextSibling.data;
            this.span.parentNode.removeChild(this.span.nextSibling);
        }

        this.span.parentNode.removeChild(this.span);
    }

    static fromSelection(sel) {
        let highlights = [];

        for (let i=0; i<sel.rangeCount; ++i) {
            let r = sel.getRangeAt(i);
            let start = r.startContainer;
            let end = r.endContainer;

            if (start.nodeType === 1)
                start = start.childNodes[0];

            if (start == end)
                highlights.push(new Highlight(start, r.startOffset, r.endOffset-r.startOffset));
            else {
                highlights.push(new Highlight(start, r.startOffset, start.data.length));

                if (end.nodeType == 3)
                    highlights.push(new Highlight(end, 0, r.endOffset));
            }
        }
        return highlights;
    }

    static fromJSON(json) {
        JSON.parse(json).forEach(h => {
            new Highlight(document.querySelector(`#${h.p}`).childNodes[0],
                          h.start, h.length);
        })
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

    let highlights = Highlight.fromSelection(sel);


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

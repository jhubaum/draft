const LINE_HEIGHT = parseInt(getComputedStyle(document.querySelector("#main"))['line-height'].replace('px', ''))

class Highlight {
    constructor(text, start, length, type, id=null) {
        this.id = null;
        this.span = null;

        if (id == null) {
            // send it to db
            fetch(URL_PREFIX + '/highlight/add', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    p: text.parentNode.getAttribute('id'),
                    start: start,
                    length: length,
                    type: type
                })
            }).then(response => response.json()).then(json => {
                this._initialize(text, start, length, type, json.id);
            });
        } else
            this._initialize(text, start, length, type, id);
    }

    _initialize(text, start, length, type, id) {
        this.id = id;

        this.span = document.createElement('span');
        this.span.classList.add('highlight', 'noselect');
        this.span.innerText = text.data.substr(start, length);
        this.span.style.backgroundColor = `var(--highlight-color-${type})`;

        this.span.addEventListener('click', e => {
            this.show_ui();
        })

        let end = text.data.substr(start+length, text.data.length);
        text.data = text.data.substr(0, start);
        text.parentNode.insertBefore(this.span, text.nextSibling);
        this.span.insertAdjacentText('afterend', end);
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
        fetch(URL_PREFIX + '/highlight/delete', {
            method: "POST",
             headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
             },
            body: JSON.stringify({
                id: this.id
            })
        })

        if (this.span.previousSibling != null &&
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

    static fromSelection(sel, type) {
        let highlights = [];

        for (let i=0; i<sel.rangeCount; ++i) {
            let r = sel.getRangeAt(i);
            let start = r.startContainer;
            let end = r.endContainer;

            if (start.nodeType === 1)
                start = start.childNodes[0];

            if (start == end)
                highlights.push(new Highlight(start, r.startOffset, r.endOffset-r.startOffset, type));
            else {
                highlights.push(new Highlight(start, r.startOffset, start.data.length-r.startOffset, type));

                if (end.nodeType == 3)
                    highlights.push(new Highlight(end, 0, r.endOffset, type));
            }
        }
        return highlights;
    }

    static fromJSON(json) {
        JSON.parse(json).forEach(h => {
            let nodes = document.querySelector(`#${h.p}`).childNodes;
            let start = h.start;

            for (let i=0; i<nodes.length; ++i) {
                if (nodes[i].nodeType == 1)
                    start -= nodes[i].innerText.length;
                else if (nodes[i].data.length < start+h.length)
                    start -= nodes[i].data.length
                else {
                    new Highlight(nodes[i], start, h.length, h.type, h.id);
                    break;
                }
            }
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

    let highlights = Highlight.fromSelection(sel, type);
    document.querySelector("#selection-ui").hide();
    sel.empty();
}

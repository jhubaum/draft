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

        let ui = document.querySelector('#highlight-ui');
        this.span.addEventListener('click', e => {
            ui.show(this.span, this);
        })

        let end = text.data.substr(start+length, text.data.length);
        text.data = text.data.substr(0, start);
        text.parentNode.insertBefore(this.span, text.nextSibling);
        this.span.insertAdjacentText('afterend', end);
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

        this._setContext(null);
        this.childNodes.forEach(c => {
            c.addEventListener('click', this.hide.bind(this));
        });
    }

    show(rect, context=null) {
        if (rect.constructor.name !== 'DOMRect') {
            let crs = rect.getClientRects();
            rect = crs[crs.length-1];
        }

        this.hidden = false;
        
        let left = rect.x + window.pageXOffset + rect.width - this.offsetWidth;
        left = Math.max(left, document.querySelector('#main').offsetLeft);
        
        this.style.left = `${left}px`;
        this.style.top = `${rect.y+window.pageYOffset+LINE_HEIGHT}px`;

        this._setContext(context);
    }

    _setContext(context) {
        this.context = context;
        this.childNodes.forEach(c => {
            c.context = context;
        });
    }

    hide() {
        this.hidden = true;
    }
}
customElements.define('context-ui', ContextUIElement, {extends: 'div'})

document.addEventListener('mouseup', e => {
    document.querySelectorAll("context-ui").forEach(c => {
        c.hide();
    });

    let sel = document.getSelection();
    
    if (sel.isCollapsed)
        return;

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

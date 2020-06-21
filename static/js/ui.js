const LINE_HEIGHT = parseInt(getComputedStyle(document.querySelector("#main"))['line-height'].replace('px', ''))

let ui = document.querySelector("#selection-ui");

document.addEventListener('mouseup', e => {
    let sel = document.getSelection();
    
    if(sel.isCollapsed) {
        ui.classList.add('hidden');
        return;
    }
    ui.classList.remove('hidden');

    let r = sel.getRangeAt(sel.rangeCount-1);
    r = r.getClientRects();
    r = r[r.length-1];

    ui.style.left = `${r.x+window.pageXOffset}px`;
    ui.style.top = `${r.y+window.pageYOffset+LINE_HEIGHT}px`;
});

function createHighlight(type) {
    let sel = document.getSelection();

    for (let i=0; i<sel.rangeCount; ++i) {
        let r = sel.getRangeAt(i);
        let start = r.startContainer;
        let end = r.endContainer;

        if (start.nodeType === 1)
            start = start.childNodes[0];

        console.log(start.nodeType, end.nodeType);

        if (start == end) {
            let s = document.createElement('span');
            s.classList.add('highlight', 'noselect');
            s.innerText = start.data.substr(r.startOffset, r.endOffset-r.startOffset);

            end = start.data.substr(r.endOffset, start.data.length);
            start.data = start.data.substr(0, r.startOffset);
            start.parentNode.insertBefore(s, start.nextSibling);
            s.insertAdjacentText('afterend', end);

            s.addEventListener('click', e => console.log("Clicked", e));


        } else {
            let s = document.createElement('span');
            s.classList.add('highlight', 'noselect');
            s.innerText = start.data.substr(r.startOffset, start.data.length);

            start.data = start.data.substr(0, r.startOffset);
            start.parentNode.insertBefore(s, start.nextSibling);

            if (end.nodeType == 3) {
                s = document.createElement('span');
                s.classList.add('highlight', 'noselect');
                s.innerText = end.data.substr(0, r.endOffset);

                end.data = end.data.substr(r.endOffset, end.data.length);
                end.parentNode.insertBefore(s, end);
            }
        }

        ui.classList.add('hidden');
    }

    sel.empty();
}

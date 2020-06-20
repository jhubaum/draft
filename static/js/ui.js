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

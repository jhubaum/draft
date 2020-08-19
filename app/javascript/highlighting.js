window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll("a[data-highlight-type]").forEach(link => {
        link.addEventListener("click", e => {
            console.log("Test");
        });
    });
});

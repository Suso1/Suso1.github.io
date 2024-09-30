let last_hover_rect;
let last_hover_highlight;
let animation_time = 0;
let highlight_radius = 0;

document.addEventListener('mouseover', evt => {
    last_hover_rect = evt.target.getBoundingClientRect();
    last_hover_highlight = evt.target.parentElement != undefined && evt.target.parentElement.classList.contains("section-select");
});

document.addEventListener('mousemove', evt => {
    document.documentElement.style.setProperty('--mouse-x', (evt.clientX - last_hover_rect.left) / last_hover_rect.width);
    document.documentElement.style.setProperty('--mouse-y', (evt.clientY - last_hover_rect.top) / last_hover_rect.height);
});

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function execute_frame(timestamp) {
    const elapsed = (timestamp - animation_time);

    highlight_radius = last_hover_highlight ? Math.min(1.0, highlight_radius + elapsed * 0.005) : 0;
    const effective_radius = easeInOutCubic(highlight_radius) * 100.0;
    document.documentElement.style.setProperty('--highlight-radius', effective_radius);

    animation_time = timestamp;
    requestAnimationFrame(execute_frame);
}

requestAnimationFrame(execute_frame);

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

    highlight_radius = last_hover_highlight ? Math.min(1.0, highlight_radius + elapsed * 0.002) : 0;
    const effective_radius = easeInOutCubic(highlight_radius) * 150.0;
    document.documentElement.style.setProperty('--highlight-radius', effective_radius);

    animation_time = timestamp;
    requestAnimationFrame(execute_frame);
}

requestAnimationFrame(execute_frame);

const headers = {
    "none": "“You find yourself in a portfolio...”",
    "shaders": "Shaders / VFX",
    "apis": "Graphics APIs",
    "c": "C / C++",
    "code": "Code Structure",
    "project": "Team / Project Management",
};

const descriptions = {
    "none": "Here you can see snippets highlighting my technical and artistic work. Use the menu on the left to navigate between sections.",
    "shaders": "Realtime visual effects achieved via shaders and particle systems.",
    "apis": "Through both personal and university projects I've gotten to work with APIs such as OpenGL and Vulkan, as well as learned about pervasive concepts in graphics.",
    "c": "I particularly enjoy building highly performant systems in low level languages. As a result, I've written a lot of C and C++.",
    "code": "Throughout the years I've worked with large codebases, learning to produce high-quality code that other team members can easily understand.",
    "project": "In the past I have taken roles as a lead, coordinating work and resources to deliver projects of a larger scale.",
};

let section_header_it;
let time_since_last_char;
let section_header;
let section_description;
let header_str;
let description_str;
let previous_typing_time;
function start_typing_section(section) {
    section_header = document.getElementById("section-header");
    section_description = document.getElementById("section-description");

    section_header_it = 0;
    time_since_last_char = 0;
    header_str = headers[section];
    description_str = descriptions[section];

    section_header.style.transition = "0.3s";
    section_description.style.transition = "0.3s";
    section_header.style.opacity = 0;
    section_description.style.opacity = 0;

    previous_typing_time = document.timeline.currentTime;
    requestAnimationFrame(type_section_header);
}

function get_dzongkha_char() {
    const options = "འདིཡངའབྲུགརྒྱངབསྒྲགས་ལས་འཛིནགྱིསའབྲུགརྒྱངབསྒྲགསལསའཛིནལུའབྲུགརྒྱངབསྒྲགསལསའཛིནགྱིཡིགའབྲུཚུབྲིསཏེཡོདཔཨིན";
    return options.charAt(Math.floor(Math.random() * options.length));
}

function type_section_header(timestamp) {
    const elapsed = (timestamp - previous_typing_time) / 1000.0;
    
    if (section_header.style.opacity == 0) {
        if (elapsed > 0.3) {
            section_header.textContent = " ";
            section_description.textContent = " ";
            
            section_header.style.transition = "0s";
            section_description.style.transition = "0s";
            section_header.style.opacity = 1;
            section_description.style.opacity = 1;

            previous_typing_time = timestamp;
        }
        requestAnimationFrame(type_section_header);
        return;
    }

    section_header.parentElement.parentElement.style.height = (section_header.parentElement.scrollHeight + 20) + "px";

    if(elapsed > 0.02) {
        section_header_it += 1;
        if (section_header_it <= header_str.length) {
            section_header.textContent = header_str.slice(0, section_header_it);
            if (section_header_it < header_str.length) {
                section_header.textContent += get_dzongkha_char();
            }
        } else if(section_header_it <= header_str.length + description_str.length) {
            section_description.textContent = description_str.slice(0, section_header_it - header_str.length);
            if (section_header_it < header_str.length + description_str.length) {
                section_description.textContent += get_dzongkha_char();
            }
        } else {
            return;
        }

        previous_typing_time = timestamp;
    }

    requestAnimationFrame(type_section_header);
}

let selected_button = null;
function selectSection(section) {
    let card_list = document.getElementById("card-list");

    Array.from(card_list.children).forEach(card => {
        card.style = card.getAttribute("section") === section ? "max-height: 400px;" : "max-height: 0; opacity: 0; padding: 0; margin-top: 0;";
    });

    lenis.scrollTo(0, 0);

    if (selected_button !== null) {
        selected_button.classList.remove("selected-section");
    }

    start_typing_section(section);

    selected_button = document.getElementById(section + "-button");
    if(selected_button === null) {
        return;
    }
    selected_button.classList.add("selected-section");
}

const lenis = new Lenis();

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

addEventListener("resize", (evt) => {
    let head = document.getElementById("section-head");
    head.style.height = (head.getElementsByTagName('div')[0].scrollHeight + 20) + "px";
});

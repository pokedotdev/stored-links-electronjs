// DOM Elements
const linksSection = document.querySelector(".links");
const errorMessage = document.querySelector(".error-message");
const newLinkForm = document.querySelector(".new-link-form");
const newLinkURL = document.querySelector(".new-link-url");
const newLinkButton = document.querySelector(".new-link-button");
const ClearStorageButton = document.querySelector(".clear-storage");

// DOM APIs
const parser = new DOMParser();
const {shell} =  require('electron');

const parserResponse = text => {
    return parser.parseFromString(text, 'text/html');
}

const findTitle = nodes => {
    return nodes.querySelector('title').innerText;
}

const storeLink = (title, url) => {
    localStorage.setItem(url, JSON.stringify({title, url}));
}

const getLinks = () => {
    return Object.keys(localStorage)
        .map(key => JSON.parse(localStorage.getItem(key)));
}

const createLinkElement = link => {
    return `
        <div>
            <h3>${link.title}</h3>
            <p><a href="${link.url}">${link.url}</a></p>
        </div>
    `;
}

const renderLinks = () => {
    const linkElements = getLinks().map(createLinkElement).join('');
    linksSection.innerHTML = linkElements;
}

const clearForm = () => {
    newLinkURL.value = null;
}

const handleError = (error, url) => {
    errorMessage.innerHTML = `
        There was and issue adding "${url}" : ${error.message}
    `.trim();
    setTimeout(() => {
        errorMessage.innerHTML = null;
    }, 5000)
}

// Events
renderLinks();

newLinkURL.addEventListener('keyup', () => {
    newLinkButton.disabled = !newLinkURL.validity.valid;
});

newLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = newLinkURL.value;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const html = parserResponse(text);
        const title = findTitle(html);
    
        storeLink(title, url);
        clearForm();
        renderLinks();
    } catch(e) {
        handleError(e, url);
    }
});

ClearStorageButton.addEventListener('click', ()=> {
    localStorage.clear();
    linksSection.innerHTML = '';
})

linksSection.addEventListener('click', e => {
    if (e.target.href) {
        e.preventDefault();
        shell.openExternal(e.target.href);
    }
})
// LISTENER VARIABLES
let lastTarget = null;

// EVENT LISTENERS
document.addEventListener("mouseover", function (event) {
    lastTarget = event.target;
    console.log("Hovered Element:", lastTarget);
}, true);

document.addEventListener("keydown", function (event) {
    let key = event.code;
    if (!lastTarget) return;

    let baseXPath = getElementXPath(lastTarget);
    console.log("Key Pressed:", key, "XPath:", baseXPath);

    if (baseXPath) {
        let similarXPath = generalizeXPath(baseXPath);
        console.log("Generalized XPath:", similarXPath);

        // Append to all matching elements recursively
        appendToSimilarElements(similarXPath);
    }
});

// FUNCTION TO APPEND TO ALL MATCHING ELEMENTS
const appendToSimilarElements = (xpath) => {
    let elements = getElementsByXPath(xpath);
    if (!elements.length) return;

    elements.forEach((el) => {
        if (!checkHref(el) || checkElementContainsClass(el, "infoExt-text-content")) return;

        let insertElement = createTextParagraph(el.href);
        getSelectedDivAndInsertDiv(el, insertElement);

        // Recursively insert into child elements
        let childXPath = getElementXPath(el) + "//*";
        appendToSimilarElements(childXPath);
    });
};

// FUNCTION TO GENERALIZE XPATH
const generalizeXPath = (xpath) => {
    return xpath.replace(/\[\d+\]/g, ""); // Remove index numbers to match similar structures
};

// FUNCTION TO GET ALL MATCHING ELEMENTS BY XPATH
const getElementsByXPath = (xpath) => {
    let result = [];
    let nodesSnapshot = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
        result.push(nodesSnapshot.snapshotItem(i));
    }
    return result;
};

// FUNCTION TO GET ELEMENT XPATH
const getElementXPath = (element) => {
    if (!element || element.nodeType !== 1) return "";
    if (element.id) return `//*[@id="${element.id}"]`;

    const parts = [];
    while (element && element.nodeType === 1) {
        let index = 1;
        let siblings = element.parentNode ? element.parentNode.children : [];
        for (let sibling of siblings) {
            if (sibling === element) break;
            if (sibling.tagName === element.tagName) index++;
        }
        parts.unshift(`${element.tagName.toLowerCase()}[${index}]`);
        element = element.parentNode;
    }
    return "/" + parts.join("/");
};

// FUNCTION TO INSERT DIV INTO SELECTED ELEMENT
const getSelectedDivAndInsertDiv = (selectedElement, insertElement) => {
    if (!selectedElement || checkElementContainsClass(selectedElement, "infoExt-text-content")) return;
    selectedElement.append(insertElement);
};

// // FUNCTION TO CREATE PARAGRAPH
// const createTextParagraph = (str) => {
//     let p = document.createElement("p");
//     p.className = "infoExt-text-content";
//     p.style.color = "black";
//     p.innerHTML = str;
//     return p;
// };

// CHECK FUNCTIONS
const checkHref = (element) => !!element.href;
const checkElementContainsClass = (element, className) => !!element.querySelector(`.${className}`);


// FUNCTION TO CREATE KEYWORDS FROM HREF
const createTextParagraph = (href) => {
    let textContainer = document.createElement("div");
    textContainer.className = "infoExt-text-content";
    textContainer.style = `
        display: flex; 
        flex-wrap: wrap; 
        gap: 5px; 
        padding: 5px;
        background: #f8f9fa; 
        border: 1px solid #ddd; 
        border-radius: 5px;
    `;

    let keywords = extractKeywordsFromHref(href);
    keywords.forEach(keyword => {
        let span = document.createElement("span");
        span.textContent = keyword;
        span.style = `
            background: #007bff; 
            color: white; 
            padding: 3px 6px; 
            border-radius: 3px;
            font-size: 12px;
            white-space: nowrap;
        `;
        textContainer.appendChild(span);
    });

    return textContainer;
};

// FUNCTION TO EXTRACT AND SPLIT KEYWORDS FROM HREF
const extractKeywordsFromHref = (href) => {
    let urlParts = new URL(href);

    // Split path by "/"
    let pathParts = urlParts.pathname.split("/").filter(Boolean);

    // Split the path parts by hyphen (-) and flatten them
    let keywords = pathParts.flatMap(part => part.split("-").filter(Boolean));

    // Handle query parameters and split them by hyphen
    urlParts.searchParams.forEach((value, key) => {
        let paramValue = `${key}=${value}`;
        keywords.push(...paramValue.split("-").filter(Boolean));
    });

    return keywords;
};

// // FUNCTION TO EXTRACT KEYWORDS FROM HREF
// const extractKeywordsFromHref = (href) => {
//     let urlParts = new URL(href);
//     let pathParts = urlParts.pathname.split("/").filter(Boolean); // Remove empty parts
//     let queryParts = urlParts.searchParams ? [...urlParts.searchParams.keys()] : []; // Get query parameters
//     return [...pathParts, ...queryParts];
// };

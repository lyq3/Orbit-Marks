document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchBookmarks();
    setupSearch();
    setupNavigation();
    setupSettings();
    setupSidebarToggle();
});

let rootNode = null;
let currentFolderId = '0';
let allFolders = []; // To easily populate sidebar

/* --- THEME SYSTEM --- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    updateLogoText(theme);

    // Update particles if they exist
    if (typeof particlesArray !== 'undefined') {
        // We might want to re-init particles or change their colors dynamically.
        // For simplicity, let the particles script handle standard colors, 
        // or simple hack: re-init to pick up new CSS variables if we used them in JS?
        // Actually our particle script is simple. Let's just leave it for now, 
        // opacity opacity change in CSS handles most of the look.
    }
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (theme === 'light') {
        // Sun icon
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
        // Moon icon
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
}

function updateLogoText(theme) {
    const text = document.querySelector('.logo-area .logo-text');
    const sub = document.getElementById('logo-subtitle');
    const cursor = document.querySelector('.logo-cursor');

    if (theme === 'light') {
        text.innerHTML = 'DevXP<span class="logo-cursor" style="color:#ea4335">.</span>UI';
        sub.textContent = '> Optimized for productivity.';
    } else {
        text.innerHTML = 'DevXP<span class="logo-cursor">_</span>';
        sub.textContent = '> System initialized. Ready to launch.';
    }
}


/* --- DATA & RENDERING --- */

function fetchBookmarks() {
    if (chrome.bookmarks) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
            rootNode = bookmarkTreeNodes[0];
            assignParentIds(rootNode); // Ensure parentIds exist (sometimes missing in getTree root descendants?)
            processSidebarItems(rootNode);
            // Default render: "Bookmarks Bar" (usually id 1) or Root if prefer
            // Let's default to the first useful child, usually "Bookmarks Bar" (id 1)
            const defaultId = rootNode.children && rootNode.children[0] ? rootNode.children[0].id : '0';
            currentFolderId = defaultId;

            renderSidebar();
            const startNode = findNodeById(rootNode, defaultId) || rootNode;
            renderFolder(startNode);
        });
    } else {
        renderMockData();
    }
}

function findNodeById(root, id) {
    if (root.id === id) return root;
    if (root.children) {
        for (let child of root.children) {
            const found = findNodeById(child, id);
            if (found) return found;
        }
    }
    return null;
}

// Extract top-level folders for sidebar
function processSidebarItems(root) {
    allFolders = [];
    // Usually root has: [Bookmarks Bar, Other Bookmarks, Mobile Bookmarks]
    // We want these as the main sidebar items.
    if (root.children) {
        allFolders = root.children;
    }
}

function assignParentIds(node, parentId = null) {
    if (parentId) {
        node.parentId = parentId;
    }
    if (node.children) {
        node.children.forEach(child => assignParentIds(child, node.id));
    }
}


// State for expanded sidebar folders
let expandedFolders = new Set();

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';

    // If allFolders is just the children of root, render each as a tree
    allFolders.forEach(folder => {
        renderSidebarNode(folder, nav, 0);
    });
}

function renderSidebarNode(node, container, depth) {
    // Only render folders in sidebar
    if (!node.children && !node.url) return; // Skip logic: typically folders have children array (even if empty) or we check !url
    // Actually, only folders have 'children' property in chrome.bookmarks.getTree results usually.
    // But let's check strict folder-ness.
    const isFolder = !node.url;
    if (!isFolder) return;

    const hasChildrenFolders = node.children && node.children.some(child => !child.url);

    // Wrapper for the item line
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-item-wrapper';
    if (node.id === currentFolderId) wrapper.classList.add('active');

    // Toggle Button (only if has children folders)
    const toggle = document.createElement('div');
    toggle.className = 'nav-toggle';
    if (hasChildrenFolders) {
        toggle.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>';
        if (expandedFolders.has(node.id)) {
            toggle.classList.add('expanded');
        }
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (expandedFolders.has(node.id)) {
                expandedFolders.delete(node.id);
            } else {
                expandedFolders.add(node.id);
            }
            renderSidebar(); // Re-render to update UI
        });
    } else {
        // Spacer
        toggle.innerHTML = '';
    }

    // Content area (Icon + Title) - Click to Navigate
    const content = document.createElement('div');
    content.className = 'nav-content';

    // First letter for collapsed state
    const firstChar = (node.title && node.title.length > 0) ? node.title.charAt(0).toUpperCase() : '?';

    content.innerHTML = `
        <svg class="nav-item-icon" style="width:16px; height:16px; opacity:0.8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
        <span class="nav-thumbnail">${firstChar}</span>
        <span class="nav-text" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${node.title}</span>
    `;

    wrapper.addEventListener('click', () => {
        currentFolderId = node.id;
        navigationStack = []; // Reset stack when jumping from sidebar
        renderSidebar();
        renderFolder(node);
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(content);
    container.appendChild(wrapper);

    // Children Container
    if (hasChildrenFolders && expandedFolders.has(node.id)) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'nav-children expanded';

        node.children.forEach(child => {
            if (!child.url) { // Recursively render only folders
                renderSidebarNode(child, childrenContainer, depth + 1);
            }
        });

        container.appendChild(childrenContainer);
    }
}

function renderFolder(folderNode) {
    const container = document.getElementById('bookmarks-container');
    const backBtnContainer = document.getElementById('nav-controls');

    container.innerHTML = '';

    // Update Nav
    if (backBtnContainer) {
        if (navigationStack.length > 0) {
            backBtnContainer.style.display = 'flex';
        } else {
            backBtnContainer.style.display = 'none';
        }
    }

    const title = document.createElement('h2');
    title.className = 'folder-title';
    title.innerHTML = `<span style="opacity:0.6; margin-right:8px;">/</span>${folderNode.title}`;
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'bookmarks-grid';

    const children = folderNode.children || [];

    if (children.length === 0) {
        container.innerHTML += '<div style="color:var(--text-secondary); padding:20px;">Empty Directory</div>';
        return;
    }

    children.forEach(child => {
        renderBookmarkItem(child, grid);
    });

    container.appendChild(grid);
}

function renderBookmarkItem(node, container) {
    const isFolder = !!node.children;

    const item = document.createElement('a');
    item.className = 'bookmark-item';
    item.href = isFolder ? '#' : node.url;
    if (!isFolder) item.target = '_blank';

    if (isFolder) {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Enter folder logic
            if (rootNode) {
                navigationStack.push(node.parentId || currentFolderId); // Simplification: assume parent is current view
                // Actually safer: push the *current* node being viewed before switching
                // But renderFolder doesn't track "current rendered node" explicitly globally well enough
                // Let's rely on the fact we are in 'currentFolderId' context?
                // Wait, 'currentFolderId' is used for sidebar active state.
                // If we drill down, sidebar might stay active on the root.
                // Let's just push the ID of the folder we are LEAVING.
                // We can't easily know that unless we store it.
                // Let's store the node's parentId if available?
                // Better: The `renderFolder` was called with SOME node. 
                // Let's assume we are drilling down from `currentFolderId`? No, could be deep.
                // Let's fix this: `renderFolder` should maybe update a global `currentViewNode`?
            }
            // For now, let's push the ID of the parent of the node we are clicking?
            // No, we want to go BACK to where we were.
            // If we are seeing this node, we are in its parent.
            navigationStack.push(node.parentId);

            renderFolder(node);
        });
    }

    const icon = document.createElement('img');
    icon.className = 'bookmark-icon';
    if (isFolder) {
        icon.src = 'data:image/svg+xml;base64,' + btoa('<svg fill="#fbbc05" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
    } else {
        try {
            const domain = new URL(node.url).hostname;
            icon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (e) {
            // Fallback for invalid URLs
            icon.src = 'data:image/svg+xml;base64,' + btoa('<svg stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle></svg>');
        }
        icon.onerror = () => icon.src = 'data:image/svg+xml;base64,' + btoa('<svg stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle></svg>');
    }

    const details = document.createElement('div');
    details.className = 'item-details';

    const title = document.createElement('span');
    title.className = 'bookmark-title';
    title.textContent = node.title;

    const sub = document.createElement('span');
    sub.className = 'bookmark-sub';
    try {
        sub.textContent = isFolder ? 'Folder' : new URL(node.url).hostname;
    } catch (e) {
        sub.textContent = isFolder ? 'Folder' : 'link';
    }

    details.appendChild(title);
    details.appendChild(sub);

    item.appendChild(icon);
    item.appendChild(details);

    container.appendChild(item);
}

function setupSearch() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.bookmark-item');
        items.forEach(item => {
            const title = item.querySelector('.bookmark-title').textContent.toLowerCase();
            if (title.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function setupNavigation() {
    const backBtn = document.getElementById('back-btn');
    // Ensure element exists now
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (navigationStack.length > 0) {
                const parentId = navigationStack.pop();
                const parentNode = findNodeById(rootNode, parentId);
                // We might be navigating back to a sidebar root, which is fine.
                if (parentNode) {
                    renderFolder(parentNode);
                }
            }
        });
    }
}

function setupSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            // Force re-render if needed or save state, but CSS handles visual logic
        });
    }
}

function setupSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Open Settings Clicked');
            alert('Settings coming soon!');
        });
    }
}

function renderMockData() {
    // Mock data with multiple top-level folders to test sidebar
    rootNode = {
        id: '0',
        title: 'Root',
        children: [
            {
                id: '1',
                title: 'Bookmarks Bar',
                children: [
                    { id: '11', title: 'Google', url: 'https://google.com' },
                    { id: '12', title: 'YouTube', url: 'https://youtube.com' },
                    {
                        id: '13', title: 'Work Stuff',
                        children: [
                            { id: '131', title: 'Jira', url: 'https://jira.com' }
                        ]
                    }
                ]
            },
            {
                id: '2',
                title: 'Other Bookmarks',
                children: [
                    { id: '21', title: 'Cooking', url: 'https://recipes.com' },
                    { id: '22', title: 'News', url: 'https://news.com' }
                ]
            }
        ]
    };



    assignParentIds(rootNode);
    processSidebarItems(rootNode);
    currentFolderId = '1';
    renderSidebar();
    renderFolder(rootNode.children[0]);
}


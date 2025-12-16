document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLocalization();
    fetchBookmarks();
    setupSearch();
    setupNavigation();
    setupSettings();
    setupSidebarToggle();
});

let rootNode = null;
let currentFolderId = '0';
let allFolders = []; // To easily populate sidebar
let navigationStack = [];

const TRANSLATIONS = {
    'en-US': {
        'brand.subtitle': '> System initialized. Ready to launch.',
        'search.placeholder': 'Search your bookmarks...',
        'nav.back': 'Back',
        'nav.bookmarks': 'Bookmarks Bar',
        'bookmarks.empty': 'Empty Directory',
        'bookmark.type.folder': 'Folder',
        'settings.title': 'Settings',
        'settings.nav.general': 'General',
        'settings.nav.about': 'About',
        'settings.language': 'Language',
        'settings.language.select': 'Select Language',
        'settings.about.version': 'v1.0.0',
        'settings.about.description': 'Bookmarks, finally home.',
        'lang.system': 'Follow System',
        'lang.zhCN': 'Simplified Chinese',
        'lang.enUS': 'English'
    },
    'zh-CN': {
        'brand.subtitle': '> 系统初始化完成。准备就绪。',
        'search.placeholder': '搜索书签...',
        'nav.back': '返回',
        'nav.bookmarks': '书签栏',
        'bookmarks.empty': '空文件夹',
        'bookmark.type.folder': '文件夹',
        'settings.title': '设置',
        'settings.nav.general': '常规',
        'settings.nav.about': '关于',
        'settings.language': '语言',
        'settings.language.select': '选择语言',
        'settings.about.version': '版本 v1.0.0',
        'settings.about.description': '书签，从此有家。',
        'lang.system': '跟随系统',
        'lang.zhCN': '简体中文',
        'lang.enUS': 'English'
    }
};

let currentLang = 'en-US';

function initLocalization() {
    const select = document.getElementById('language-select');
    const savedLang = localStorage.getItem('nestlink_language') || 'system';

    if (select) {
        select.value = savedLang;
        select.addEventListener('change', (event) => {
            const newLang = event.target.value;
            localStorage.setItem('nestlink_language', newLang);
            updateLanguage(newLang);
        });
    }

    updateLanguage(savedLang);
}

function updateLanguage(langPref) {
    const resolvedLang = resolveLanguage(langPref);
    currentLang = resolvedLang;
    const dictionary = TRANSLATIONS[resolvedLang] || TRANSLATIONS['en-US'];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (dictionary[key]) {
            el.textContent = dictionary[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        if (dictionary[key]) {
            el.placeholder = dictionary[key];
        }
    });

    if (allFolders.length > 0) {
        renderSidebar();
        if (rootNode) {
            const active = findNodeById(rootNode, currentFolderId);
            if (active) {
                renderFolder(active);
            }
        }
    }
}

function resolveLanguage(langPref) {
    if (langPref === 'system') {
        const sysLang = navigator.language || 'en-US';
        return sysLang.startsWith('zh') ? 'zh-CN' : 'en-US';
    }
    return TRANSLATIONS[langPref] ? langPref : 'en-US';
}

function t(key, fallback = '') {
    const dictionary = TRANSLATIONS[currentLang] || TRANSLATIONS['en-US'];
    return dictionary[key] || fallback || key;
}

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

    if (theme === 'light') {
        text.innerHTML = 'NestLink<span class="logo-cursor" style="color:#ea4335">.</span>';
    } else {
        text.innerHTML = 'NestLink<span class="logo-cursor">_</span>';
    }

    if (sub) {
        sub.textContent = t('brand.subtitle', '> System initialized. Ready to launch.');
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

            // Memory: Load last active folder
            const savedId = localStorage.getItem('nestlink_last_folder');
            let startNode = null;

            if (savedId) {
                startNode = findNodeById(rootNode, savedId);
            }

            if (startNode) {
                currentFolderId = savedId;
                // Auto-expand parents so this folder is visible
                expandPathToNode(rootNode, savedId);
            } else {
                currentFolderId = defaultId;
                startNode = findNodeById(rootNode, defaultId) || rootNode;
            }

            renderSidebar();

            // "Click" simulation to ensure consistent loading behavior
            setTimeout(() => {
                const targetId = startNode ? startNode.id : defaultId;
                const sidebarItem = document.querySelector(`.nav-item-wrapper[data-id="${targetId}"]`);

                if (sidebarItem) {
                    console.log('Triggering auto-click on:', targetId);
                    sidebarItem.click();
                    // Scroll into view if needed
                    sidebarItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
                } else {
                    // Fallback if sidebar item not found (shouldn't happen if expanded correctly)
                    console.log('Sidebar item not found, manual render:', targetId);
                    renderFolder(startNode);
                }
            }, 50); // Small delay to ensure DOM is ready
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

function expandPathToNode(root, targetId) {
    if (root.id === targetId) return true;
    if (root.children) {
        for (let child of root.children) {
            if (expandPathToNode(child, targetId)) {
                expandedFolders.add(root.id);
                return true;
            }
        }
    }
    return false;
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
    const rawLabel = node.title || 'Untitled';
    const displayLabel = (node.id === '1' && rawLabel === 'Bookmarks Bar') ? t('nav.bookmarks', rawLabel) : rawLabel;

    // Wrapper for the item line
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-item-wrapper';
    wrapper.dataset.id = node.id; // Add ID for easy selection
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
    const firstChar = displayLabel && displayLabel.length > 0 ? displayLabel.charAt(0).toUpperCase() : '?';

    content.innerHTML = `
        <svg class="nav-item-icon" style="width:16px; height:16px; opacity:0.8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
        <span class="nav-thumbnail">${firstChar}</span>
        <span class="nav-text" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayLabel}</span>
    `;

    wrapper.addEventListener('click', () => {
        currentFolderId = node.id;
        localStorage.setItem('nestlink_last_folder', currentFolderId);
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
        const emptyState = document.createElement('div');
        emptyState.style.color = 'var(--text-secondary)';
        emptyState.style.padding = '20px';
        emptyState.textContent = t('bookmarks.empty', 'Empty Directory');
        container.appendChild(emptyState);
        return;
    }

    let renderedCount = 0;
    children.forEach(child => {
        try {
            renderBookmarkItem(child, grid);
            renderedCount++;
        } catch (err) {
            console.error(err);
            const errDiv = document.createElement('div');
            errDiv.style.color = 'red';
            errDiv.textContent = 'Item Error: ' + err.message;
            grid.appendChild(errDiv);
        }
    });

    container.appendChild(grid);
    // Debug footer to confirm render finish
    // container.innerHTML += `<div style="font-size:10px; color:#ccc; margin-top:20px;">Rendered ${renderedCount} items.</div>`;
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
    const folderLabel = t('bookmark.type.folder', 'Folder');
    try {
        sub.textContent = isFolder ? folderLabel : new URL(node.url).hostname;
    } catch (e) {
        sub.textContent = isFolder ? folderLabel : 'link';
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
    const overlay = document.getElementById('settings-overlay');
    const closeBtn = document.getElementById('close-settings-btn');
    const navList = document.querySelector('.settings-nav');

    if (settingsBtn && overlay) {
        settingsBtn.addEventListener('click', () => {
            const savedLang = localStorage.getItem('nestlink_language') || 'system';
            const select = document.getElementById('language-select');
            if (select) {
                select.value = savedLang;
            }
            overlay.classList.add('open');
        });
    }

    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('open');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    }

    if (navList) {
        navList.addEventListener('click', (event) => {
            const tabTrigger = event.target.closest('li');
            if (!tabTrigger) return;

            navList.querySelectorAll('li').forEach((item) => item.classList.remove('active'));
            tabTrigger.classList.add('active');

            const targetId = `tab-${tabTrigger.dataset.tab}`;
            document.querySelectorAll('.settings-tab-content').forEach((content) => {
                if (content.id === targetId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
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

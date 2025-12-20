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

// Fallback icon SVG for bookmarks with invalid URLs or failed favicon loads
const FALLBACK_ICON_SVG = 'data:image/svg+xml;base64,' + btoa('<svg stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle></svg>');

const TRANSLATIONS = {
    'en-US': {
        'brand.subtitle': 'OrbitMarks · Bookmarks in order, free to roam.',
        'search.placeholder': 'Search your bookmarks...',
        'search.placeholder.global': 'Search all bookmarks...',
        'search.mode.folder': 'Search current folder',
        'search.mode.global': 'Search all bookmarks',
        'search.no.results': 'No bookmarks found',
        'nav.back': 'Back',
        'nav.untitled': 'Untitled',
        'bookmarks.empty': 'Empty Directory',
        'bookmark.type.folder': 'Folder',
        'settings.title': 'Settings',
        'settings.nav.general': 'General',
        'settings.nav.feedback': 'Feedback',
        'settings.nav.about': 'About',
        'settings.language': 'Language',
        'settings.language.select': 'Select Language',
        'settings.about.version': 'v1.2.3',
        'settings.about.description': 'Bookmarks in order, free to roam.',
        'lang.system': 'Follow System',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': 'We value your feedback!',
        'settings.feedback.subtitle': 'Thank you for using OrbitMarks! Share your thoughts below or email us at <a href="mailto:support@btman.net">support@btman.net</a>.',
        'settings.feedback.cta': 'Questions or ideas? Drop us a line at support@btman.net.'
    },
    'zh-CN': {
        'brand.subtitle': 'OrbitMarks · 书签有序，自由随行。',
        'search.placeholder': '搜索书签...',
        'search.placeholder.global': '搜索所有书签...',
        'search.mode.folder': '搜索当前文件夹',
        'search.mode.global': '搜索所有书签',
        'search.no.results': '未找到书签',
        'nav.back': '返回',
        'nav.untitled': '未命名',
        'bookmarks.empty': '空文件夹',
        'bookmark.type.folder': '文件夹',
        'settings.title': '设置',
        'settings.nav.general': '常规',
        'settings.nav.feedback': '反馈',
        'settings.nav.about': '关于',
        'settings.language': '语言',
        'settings.language.select': '选择语言',
        'settings.about.version': '版本 v1.2.3',
        'settings.about.description': '书签有序，自由随行。',
        'lang.system': '跟随系统',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': '我们重视你的反馈！',
        'settings.feedback.subtitle': '感谢使用 OrbitMarks！欢迎在下方分享你的想法，或直接发送邮件至 <a href="mailto:support@btman.net">support@btman.net</a>。',
        'settings.feedback.cta': '有任何想法，欢迎发送邮件至 support@btman.net。'
    },
    'zh-TW': {
        'brand.subtitle': 'OrbitMarks · 書籤有序，自由隨行。',
        'search.placeholder': '搜尋書籤...',
        'search.placeholder.global': '搜尋所有書籤...',
        'search.mode.folder': '搜尋當前資料夾',
        'search.mode.global': '搜尋所有書籤',
        'search.no.results': '未找到書籤',
        'nav.back': '返回',
        'nav.untitled': '未命名',
        'bookmarks.empty': '空資料夾',
        'bookmark.type.folder': '資料夾',
        'settings.title': '設定',
        'settings.nav.general': '一般',
        'settings.nav.feedback': '回饋',
        'settings.nav.about': '關於',
        'settings.language': '語言',
        'settings.language.select': '選擇語言',
        'settings.about.version': '版本 v1.2.3',
        'settings.about.description': '書籤有序，自由隨行。',
        'lang.system': '跟隨系統',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': '我們重視你的回饋！',
        'settings.feedback.subtitle': '感謝使用 OrbitMarks！歡迎在下方分享想法，或寄信至 <a href="mailto:support@btman.net">support@btman.net</a>。',
        'settings.feedback.cta': '有任何點子，都可以寫信到 support@btman.net。'
    },
    'ja-JP': {
        'brand.subtitle': 'OrbitMarks · ブックマークを整え、自由に巡航。',
        'search.placeholder': 'ブックマークを検索...',
        'search.placeholder.global': 'すべてのブックマークを検索...',
        'search.mode.folder': '現在のフォルダーを検索',
        'search.mode.global': 'すべてのブックマークを検索',
        'search.no.results': 'ブックマークが見つかりません',
        'nav.back': '戻る',
        'nav.untitled': '無題',
        'bookmarks.empty': 'フォルダーは空です',
        'bookmark.type.folder': 'フォルダー',
        'settings.title': '設定',
        'settings.nav.general': '一般',
        'settings.nav.feedback': 'フィードバック',
        'settings.nav.about': '情報',
        'settings.language': '言語',
        'settings.language.select': '言語を選択',
        'settings.about.version': 'バージョン v1.2.3',
        'settings.about.description': 'ブックマークを整えて、自由に巡航。',
        'lang.system': 'システムに従う',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': 'フィードバックをお待ちしています！',
        'settings.feedback.subtitle': 'OrbitMarks をご利用いただきありがとうございます。フォーム、または <a href="mailto:support@btman.net">support@btman.net</a> までお気軽にご連絡ください。',
        'settings.feedback.cta': 'お気軽に support@btman.net へご連絡ください。'
    },
    'ko-KR': {
        'brand.subtitle': 'OrbitMarks · 북마크를 정돈하고 자유롭게 순항하세요.',
        'search.placeholder': '북마크 검색...',
        'search.placeholder.global': '모든 북마크 검색...',
        'search.mode.folder': '현재 폴더 검색',
        'search.mode.global': '모든 북마크 검색',
        'search.no.results': '북마크를 찾을 수 없습니다',
        'nav.back': '뒤로',
        'nav.untitled': '제목 없음',
        'bookmarks.empty': '비어 있는 폴더',
        'bookmark.type.folder': '폴더',
        'settings.title': '설정',
        'settings.nav.general': '일반',
        'settings.nav.feedback': '피드백',
        'settings.nav.about': '정보',
        'settings.language': '언어',
        'settings.language.select': '언어 선택',
        'settings.about.version': '버전 v1.2.3',
        'settings.about.description': '북마크를 정돈하고 자유롭게 순항하세요.',
        'lang.system': '시스템과 동일',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': '피드백을 들려주세요!',
        'settings.feedback.subtitle': 'OrbitMarks를 사용해 주셔서 감사합니다. 아래에 의견을 남기거나 <a href="mailto:support@btman.net">support@btman.net</a> 으로 메일을 보내 주세요.',
        'settings.feedback.cta': '아이디어가 있다면 support@btman.net 으로 보내 주세요.'
    },
    'es-ES': {
        'brand.subtitle': 'OrbitMarks · Marcadores en orden, libres para moverse.',
        'search.placeholder': 'Busca en tus marcadores...',
        'search.placeholder.global': 'Buscar en todos los marcadores...',
        'search.mode.folder': 'Buscar en carpeta actual',
        'search.mode.global': 'Buscar en todos los marcadores',
        'search.no.results': 'No se encontraron marcadores',
        'nav.back': 'Volver',
        'nav.untitled': 'Sin título',
        'bookmarks.empty': 'Carpeta vacía',
        'bookmark.type.folder': 'Carpeta',
        'settings.title': 'Configuración',
        'settings.nav.general': 'General',
        'settings.nav.feedback': 'Comentarios',
        'settings.nav.about': 'Acerca de',
        'settings.language': 'Idioma',
        'settings.language.select': 'Seleccionar idioma',
        'settings.about.version': 'Versión v1.2.3',
        'settings.about.description': 'Marcadores en orden, libres para moverse.',
        'lang.system': 'Seguir sistema',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': '¡Tu opinión es importante!',
        'settings.feedback.subtitle': 'Gracias por usar OrbitMarks. Comparte tus ideas abajo o escríbenos a <a href="mailto:support@btman.net">support@btman.net</a>.',
        'settings.feedback.cta': '¿Tienes ideas? Escríbenos a support@btman.net.'
    },
    'fr-FR': {
        'brand.subtitle': 'OrbitMarks · Favoris ordonnés, liberté de navigation.',
        'search.placeholder': 'Recherchez dans vos favoris...',
        'search.placeholder.global': 'Rechercher dans tous les favoris...',
        'search.mode.folder': 'Rechercher dans le dossier actuel',
        'search.mode.global': 'Rechercher dans tous les favoris',
        'search.no.results': 'Aucun favori trouvé',
        'nav.back': 'Retour',
        'nav.untitled': 'Sans titre',
        'bookmarks.empty': 'Dossier vide',
        'bookmark.type.folder': 'Dossier',
        'settings.title': 'Paramètres',
        'settings.nav.general': 'Général',
        'settings.nav.feedback': 'Retour',
        'settings.nav.about': 'À propos',
        'settings.language': 'Langue',
        'settings.language.select': 'Choisir une langue',
        'settings.about.version': 'Version v1.2.3',
        'settings.about.description': 'Favoris ordonnés, liberté de navigation.',
        'lang.system': 'Suivre le système',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': 'Vos retours comptent !',
        'settings.feedback.subtitle': 'Merci d’utiliser OrbitMarks. Partagez vos idées ci-dessous ou écrivez-nous à <a href="mailto:support@btman.net">support@btman.net</a>.',
        'settings.feedback.cta': 'Une idée ? Écrivez-nous à support@btman.net.'
    },
    'de-DE': {
        'brand.subtitle': 'OrbitMarks · Lesezeichen geordnet, jederzeit griffbereit.',
        'search.placeholder': 'Lesezeichen durchsuchen...',
        'search.placeholder.global': 'Alle Lesezeichen durchsuchen...',
        'search.mode.folder': 'Aktuellen Ordner durchsuchen',
        'search.mode.global': 'Alle Lesezeichen durchsuchen',
        'search.no.results': 'Keine Lesezeichen gefunden',
        'nav.back': 'Zurück',
        'nav.untitled': 'Unbenannt',
        'bookmarks.empty': 'Ordner ist leer',
        'bookmark.type.folder': 'Ordner',
        'settings.title': 'Einstellungen',
        'settings.nav.general': 'Allgemein',
        'settings.nav.feedback': 'Feedback',
        'settings.nav.about': 'Info',
        'settings.language': 'Sprache',
        'settings.language.select': 'Sprache auswählen',
        'settings.about.version': 'Version v1.2.3',
        'settings.about.description': 'Lesezeichen geordnet, jederzeit griffbereit.',
        'lang.system': 'Systemsprache verwenden',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': 'Wir freuen uns über Feedback!',
        'settings.feedback.subtitle': 'Danke, dass du OrbitMarks nutzt. Teile deine Gedanken hier oder schreibe uns an <a href="mailto:support@btman.net">support@btman.net</a>.',
        'settings.feedback.cta': 'Hast du Ideen? Schreib uns an support@btman.net.'
    },
    'pt-BR': {
        'brand.subtitle': 'OrbitMarks · Favoritos organizados, livres para seguir.',
        'search.placeholder': 'Pesquise nos seus favoritos...',
        'search.placeholder.global': 'Pesquisar em todos os favoritos...',
        'search.mode.folder': 'Pesquisar na pasta atual',
        'search.mode.global': 'Pesquisar em todos os favoritos',
        'search.no.results': 'Nenhum favorito encontrado',
        'nav.back': 'Voltar',
        'nav.untitled': 'Sem título',
        'bookmarks.empty': 'Pasta vazia',
        'bookmark.type.folder': 'Pasta',
        'settings.title': 'Configurações',
        'settings.nav.general': 'Geral',
        'settings.nav.feedback': 'Feedback',
        'settings.nav.about': 'Sobre',
        'settings.language': 'Idioma',
        'settings.language.select': 'Selecione o idioma',
        'settings.about.version': 'Versão v1.2.3',
        'settings.about.description': 'Favoritos organizados, livres para seguir.',
        'lang.system': 'Seguir sistema',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': 'A sua opinião importa!',
        'settings.feedback.subtitle': 'Obrigado por usar o OrbitMarks. Compartilhe suas ideias abaixo ou envie um e-mail para <a href="mailto:support@btman.net">support@btman.net</a>.',
        'settings.feedback.cta': 'Tem alguma ideia? Fale com a gente em support@btman.net.'
    },
    'ru-RU': {
        'brand.subtitle': 'OrbitMarks · Закладки в порядке, свобода передвижения.',
        'search.placeholder': 'Ищите по закладкам...',
        'search.placeholder.global': 'Искать по всем закладкам...',
        'search.mode.folder': 'Искать в текущей папке',
        'search.mode.global': 'Искать по всем закладкам',
        'search.no.results': 'Закладки не найдены',
        'nav.back': 'Назад',
        'nav.untitled': 'Без названия',
        'bookmarks.empty': 'Папка пуста',
        'bookmark.type.folder': 'Папка',
        'settings.title': 'Настройки',
        'settings.nav.general': 'Общие',
        'settings.nav.feedback': 'Обратная связь',
        'settings.nav.about': 'О приложении',
        'settings.language': 'Язык',
        'settings.language.select': 'Выберите язык',
        'settings.about.version': 'Версия v1.2.3',
        'settings.about.description': 'Закладки в порядке, свобода передвижения.',
        'lang.system': 'Следовать системе',
        'lang.zhCN': '简体中文',
        'lang.zhTW': '繁體中文',
        'lang.enUS': 'English',
        'lang.jaJP': '日本語',
        'lang.koKR': '한국어',
        'lang.esES': 'Español',
        'lang.frFR': 'Français',
        'lang.deDE': 'Deutsch',
        'lang.ptBR': 'Português (Brasil)',
        'lang.ruRU': 'Русский',
        'settings.feedback.title': 'Нам важна ваша обратная связь!',
        'settings.feedback.subtitle': 'Спасибо, что пользуетесь OrbitMarks. Поделитесь мнением ниже или напишите на <a href="mailto:support@btman.net">support@btman.net</a>.',
        'settings.feedback.cta': 'Есть идеи? Напишите на support@btman.net.'
    }
};

let currentLang = 'en-US';

function initLocalization() {
    const select = document.getElementById('language-select');
    const savedLang = localStorage.getItem('orbitmarks_language') || 'system';

    if (select) {
        select.value = savedLang;
        select.addEventListener('change', (event) => {
            const newLang = event.target.value;
            localStorage.setItem('orbitmarks_language', newLang);
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

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.dataset.i18nHtml;
        if (dictionary[key]) {
            el.innerHTML = dictionary[key];
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
        if (TRANSLATIONS[sysLang]) return sysLang;
        const prefix = sysLang.split('-')[0];
        const match = Object.keys(TRANSLATIONS).find(code => code.startsWith(prefix));
        return match || 'en-US';
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
    // Particle colors are handled by CSS opacity changes for different themes
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
        text.innerHTML = 'OrbitMarks<span class="logo-cursor" style="color:#fbbf24">.</span>';
    } else {
        text.innerHTML = 'OrbitMarks<span class="logo-cursor">_</span>';
    }

    if (sub) {
        sub.textContent = t('brand.subtitle', 'OrbitMarks · Bookmarks in order, free to roam.');
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
            const savedId = localStorage.getItem('orbitmarks_last_folder');
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
                    sidebarItem.click();
                    // Scroll into view if needed
                    sidebarItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
                } else {
                    // Fallback if sidebar item not found (shouldn't happen if expanded correctly)
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
    // Chrome automatically localizes root folder names (书签栏, 其他书签, etc.)
    // so we just use the title as-is
    const displayLabel = node.title || t('nav.untitled', 'Untitled');

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

    // Create elements safely to prevent XSS
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('class', 'nav-item-icon');
    iconSvg.setAttribute('style', 'width:16px; height:16px; opacity:0.8;');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.setAttribute('stroke', 'currentColor');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z');
    iconSvg.appendChild(path);

    const thumbnail = document.createElement('span');
    thumbnail.className = 'nav-thumbnail';
    thumbnail.textContent = firstChar;

    const navText = document.createElement('span');
    navText.className = 'nav-text';
    navText.style.cssText = 'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
    navText.textContent = displayLabel;

    content.appendChild(iconSvg);
    content.appendChild(thumbnail);
    content.appendChild(navText);

    wrapper.addEventListener('click', () => {
        currentFolderId = node.id;
        localStorage.setItem('orbitmarks_last_folder', currentFolderId);
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
    const searchInput = document.getElementById('search-input');

    container.innerHTML = '';

    // Clear search input when switching folders
    if (searchInput) {
        searchInput.value = '';
    }

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
    const slash = document.createElement('span');
    slash.style.cssText = 'opacity:0.6; margin-right:8px;';
    slash.textContent = '/';
    title.appendChild(slash);
    title.appendChild(document.createTextNode(folderNode.title));
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
            // Push the parent folder ID to navigation stack so we can go back
            if (node.parentId) {
                navigationStack.push(node.parentId);
            }
            // Update currentFolderId and re-render sidebar to sync highlight
            currentFolderId = node.id;
            renderSidebar();
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
            icon.src = FALLBACK_ICON_SVG;
        }
        icon.onerror = () => icon.src = FALLBACK_ICON_SVG;
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

// Global search state
let isGlobalSearchMode = false;
let searchDebounceTimer = null;
let pathCache = new Map(); // Cache for folder paths

function setupSearch() {
    const input = document.getElementById('search-input');
    const modeToggle = document.getElementById('search-mode-toggle');
    const folderIcon = document.getElementById('search-mode-icon-folder');
    const globalIcon = document.getElementById('search-mode-icon-global');
    const resultsContainer = document.getElementById('global-search-results');

    // Load saved search mode
    isGlobalSearchMode = localStorage.getItem('orbitmarks_search_mode') === 'global';
    updateSearchModeUI();

    // Toggle search mode
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            isGlobalSearchMode = !isGlobalSearchMode;
            localStorage.setItem('orbitmarks_search_mode', isGlobalSearchMode ? 'global' : 'folder');
            updateSearchModeUI();
            // Re-trigger search if there's a query
            if (input.value.trim()) {
                handleSearch(input.value);
            }
        });
    }

    // Handle search input with debounce
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Clear previous timer
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }

        // Debounce for global search (300ms)
        if (isGlobalSearchMode && query) {
            searchDebounceTimer = setTimeout(() => {
                handleSearch(query);
            }, 300);
        } else {
            handleSearch(query);
        }
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (resultsContainer && !e.target.closest('.search-wrapper')) {
            resultsContainer.classList.remove('visible');
        }
    });

    // Close results on Escape key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            handleSearch('');
            resultsContainer.classList.remove('visible');
        }
    });

    function updateSearchModeUI() {
        if (folderIcon && globalIcon && modeToggle) {
            if (isGlobalSearchMode) {
                folderIcon.style.display = 'none';
                globalIcon.style.display = 'block';
                modeToggle.classList.add('global-mode');
                modeToggle.title = t('search.mode.global', 'Search all bookmarks');
                input.placeholder = t('search.placeholder.global', 'Search all bookmarks...');
            } else {
                folderIcon.style.display = 'block';
                globalIcon.style.display = 'none';
                modeToggle.classList.remove('global-mode');
                modeToggle.title = t('search.mode.folder', 'Search current folder');
                input.placeholder = t('search.placeholder', 'Search your bookmarks...');
            }
        }
    }

    function handleSearch(query) {
        const lowerQuery = query.toLowerCase();

        if (isGlobalSearchMode) {
            // Global search mode
            if (!query) {
                resultsContainer.classList.remove('visible');
                resultsContainer.innerHTML = '';
                return;
            }
            const results = searchAllBookmarks(rootNode, lowerQuery);
            renderGlobalSearchResults(results.slice(0, 50)); // Limit to 50 results
        } else {
            // Folder search mode (original behavior)
            resultsContainer.classList.remove('visible');
            const items = document.querySelectorAll('.bookmark-item');
            items.forEach(item => {
                const title = item.querySelector('.bookmark-title').textContent.toLowerCase();
                const url = item.href ? item.href.toLowerCase() : '';
                if (title.includes(lowerQuery) || url.includes(lowerQuery)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    }
}

// Recursively search all bookmarks
function searchAllBookmarks(node, query, results = []) {
    if (!node) return results;

    // Check if this bookmark matches (only URLs, not folders)
    if (node.url) {
        const titleMatch = node.title && node.title.toLowerCase().includes(query);
        const urlMatch = node.url.toLowerCase().includes(query);
        if (titleMatch || urlMatch) {
            results.push({
                id: node.id,
                title: node.title,
                url: node.url,
                parentId: node.parentId,
                path: getBookmarkPath(node.parentId)
            });
        }
    }

    // Recursively search children
    if (node.children) {
        node.children.forEach(child => searchAllBookmarks(child, query, results));
    }

    return results;
}

// Get the folder path for a bookmark
function getBookmarkPath(parentId) {
    if (!parentId) return '';

    // Check cache first
    if (pathCache.has(parentId)) {
        return pathCache.get(parentId);
    }

    const pathParts = [];
    let currentId = parentId;

    while (currentId && currentId !== '0') {
        const node = findNodeById(rootNode, currentId);
        if (node && node.title) {
            pathParts.unshift(node.title);
        }
        currentId = node ? node.parentId : null;
    }

    const path = pathParts.join(' / ');
    pathCache.set(parentId, path);
    return path;
}

// Render global search results dropdown
function renderGlobalSearchResults(results) {
    const container = document.getElementById('global-search-results');
    container.innerHTML = '';

    if (results.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'global-search-empty';
        empty.textContent = t('search.no.results', 'No bookmarks found');
        container.appendChild(empty);
        container.classList.add('visible');
        return;
    }

    results.forEach(bookmark => {
        const item = document.createElement('a');
        item.className = 'global-search-item';
        item.href = bookmark.url;
        item.target = '_blank';

        // Icon
        const icon = document.createElement('img');
        icon.className = 'item-icon';
        try {
            const domain = new URL(bookmark.url).hostname;
            icon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (e) {
            icon.src = FALLBACK_ICON_SVG;
        }
        icon.onerror = () => icon.src = FALLBACK_ICON_SVG;

        // Info container
        const info = document.createElement('div');
        info.className = 'item-info';

        // Title
        const title = document.createElement('div');
        title.className = 'item-title';
        title.textContent = bookmark.title || bookmark.url;

        // Path
        const path = document.createElement('div');
        path.className = 'item-path';

        // Folder icon
        const folderSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        folderSvg.setAttribute('width', '12');
        folderSvg.setAttribute('height', '12');
        folderSvg.setAttribute('viewBox', '0 0 24 24');
        folderSvg.setAttribute('fill', 'none');
        folderSvg.setAttribute('stroke', 'currentColor');
        folderSvg.setAttribute('stroke-width', '2');
        const folderPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        folderPath.setAttribute('d', 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z');
        folderSvg.appendChild(folderPath);

        path.appendChild(folderSvg);
        path.appendChild(document.createTextNode(bookmark.path || 'Root'));

        info.appendChild(title);
        info.appendChild(path);

        item.appendChild(icon);
        item.appendChild(info);

        container.appendChild(item);
    });

    container.classList.add('visible');
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
                    // Update currentFolderId and re-render sidebar to sync highlight
                    currentFolderId = parentNode.id;
                    renderSidebar();
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
            const savedLang = localStorage.getItem('orbitmarks_language') || 'system';
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
                    { id: '13', title: 'OrbitMarks Landing Page', url: 'https://orbitmarks.app' },
                    {
                        id: '14', title: 'Work Dashboard',
                        url: 'https://notion.so/work-dashboard'
                    },
                    {
                        id: '15', title: 'Daily Tools',
                        children: [
                            { id: '151', title: 'Linear', url: 'https://linear.app' },
                            { id: '152', title: 'Figma', url: 'https://figma.com' },
                            { id: '153', title: 'Asana', url: 'https://asana.com' }
                        ]
                    },
                    {
                        id: '16', title: 'Research',
                        children: [
                            { id: '161', title: 'Arc Design Articles', url: 'https://arc.net/library' },
                            { id: '162', title: 'Smashing Magazine', url: 'https://smashingmagazine.com' },
                            { id: '163', title: 'Dev.to', url: 'https://dev.to' }
                        ]
                    },
                    {
                        id: '17', title: 'Work Stuff',
                        children: [
                            { id: '171', title: 'Jira', url: 'https://jira.com' },
                            { id: '172', title: 'GitHub Issues', url: 'https://github.com/issues' },
                            { id: '173', title: 'Analytics Dashboard', url: 'https://datastudio.google.com' }
                        ]
                    }
                ]
            },
            {
                id: '2',
                title: 'Other Bookmarks',
                children: [
                    { id: '21', title: 'Cooking', url: 'https://tastespotting.com' },
                    { id: '22', title: 'Morning News', url: 'https://news.com' },
                    {
                        id: '23',
                        title: 'Learn',
                        children: [
                            { id: '231', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
                            { id: '232', title: 'CSS-Tricks Almanac', url: 'https://css-tricks.com/almanac/' },
                            { id: '233', title: 'Khan Academy CS', url: 'https://khanacademy.org/computing' }
                        ]
                    },
                    {
                        id: '24',
                        title: 'Inspiration Boards',
                        children: [
                            { id: '241', title: 'Awwwards', url: 'https://awwwards.com' },
                            { id: '242', title: 'Dribbble Shots', url: 'https://dribbble.com' },
                            { id: '243', title: 'Behance Curated', url: 'https://behance.net/galleries' }
                        ]
                    }
                ]
            },
            {
                id: '3',
                title: 'Reading List',
                children: [
                    { id: '31', title: 'Wait But Why', url: 'https://waitbutwhy.com' },
                    { id: '32', title: 'Stratechery', url: 'https://stratechery.com' },
                    { id: '33', title: 'Every.to', url: 'https://every.to' },
                    {
                        id: '34',
                        title: 'Podcasts',
                        children: [
                            { id: '341', title: 'Lex Fridman', url: 'https://lexfridman.com/podcast/' },
                            { id: '342', title: 'Acquired', url: 'https://www.acquired.fm/' },
                            { id: '343', title: 'Indie Hackers', url: 'https://www.indiehackers.com/podcast' }
                        ]
                    }
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

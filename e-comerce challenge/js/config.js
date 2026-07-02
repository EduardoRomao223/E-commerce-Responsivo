// Configuração de paths
const APP_CONFIG = {
    baseUrl: window.location.pathname.includes('/pages/') ? '../' : './',
    pagesUrl: window.location.pathname.includes('/pages/') ? './' : 'pages/'
};

// Função para criar paths corretos
function getPagePath(pageName) {
    return `${APP_CONFIG.pagesUrl}${pageName}`;
}

function getAssetPath(assetName) {
    return `${APP_CONFIG.baseUrl}assets/${assetName}`;
}
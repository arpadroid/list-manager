/** @type {import('@arpadroid/module').BuildConfigType} */
const config = {
    buildTypes: true,
    buildI18n: true,
    deps: ['messages', 'navigation', 'forms'],
    buildType: 'uiComponent',
    storybook_port: 6011,
    buildManifest: true,
    turbo: false
};

export default config;

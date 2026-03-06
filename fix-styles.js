const fs = require('fs');
const file = 'app/components/MainWebsite.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/style="([^"]*)"/g, (match, styles) => {
    let result = "style={{";
    styles.split(';').forEach(s => {
        if (!s.trim()) return;
        const [key, value] = s.split(':');
        if (!key || !value) return;
        const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        result += ` ${camelKey}: "${value.trim().replace(/"/g, "'")}",`;
    });
    result += " }}";
    return result;
});

// also fix some void elements that might be missing closure
content = content.replace(/<source(.*?)>/g, (m, g1) => {
    if (g1.endsWith('/')) return m;
    return `<source${g1} />`;
});

fs.writeFileSync(file, content);
console.log("Fixed JSX styles");

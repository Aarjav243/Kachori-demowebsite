const fs = require('fs');
const file = 'app/components/MainWebsite.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
content = content.replace(/autoplay/g, 'autoPlay');
content = content.replace(/playsinline/g, 'playsInline');
content = content.replace(/for="/g, 'htmlFor="');
content = content.replace(/tabindex="/g, 'tabIndex="');

fs.writeFileSync(file, content);
console.log("Fixed JSX");

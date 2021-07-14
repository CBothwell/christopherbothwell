const now = String(Date.now());
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const Image = require('@11ty/eleventy-img');
const markdownIt = require('markdown-it');
const markdownItClass = require('@toycode/markdown-it-class');

const sharp = require('sharp');

async function generateFavicon(filename, width, height) {
      const fileSize = `${width}x${height}`;
      const fileName = `favicon-${fileSize}.png`; 
      sharp(filename, {failOnError: true})
        .resize(width, height)
        .png()
        .toFile(`_site/${fileName}`)
      return `<link rel="icon" type="image/png" href="/${fileName}" sizes="${fileSize}">`
}

async function faviconShortcode(img) {
  //const img = src;
  console.log(`Building new favicon ${img}`);
  const faviconList = await Promise.all([
    generateFavicon(img, 16, 16),
    generateFavicon(img, 32, 32),
    generateFavicon(img, 96, 96),
  ]);
  return faviconList.join('\n');
}

async function imageShortcode(src, alt, sizes, imageClassNames) {
  let metadata = await Image(src, {
    widths: [300, 600, 700],
    formats: ["avif", "jpeg"],
    outputDir: "./_site/img"
  });

  let imageAttributes = {
    alt,
    sizes,
    "class": imageClassNames,
    loading: "lazy",
    decoding: "async",
    outputDir: "_site/img"
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

const mapping = {
  h1: ['text-2xl'],
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./_site/js/index.js');

  eleventyConfig.addWatchTarget('./_site/style.css')
  eleventyConfig.addShortcode('version', function () {
    return now
  })
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("favicon", faviconShortcode); 

  const md = markdownIt({linkify: true, html: true});
  md.use(markdownItClass, mapping);
  eleventyConfig.setLibrary('md', md);
};

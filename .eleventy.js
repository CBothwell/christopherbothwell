const now = String(Date.now());
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const Image = require('@11ty/eleventy-img');
const markdownIt = require('markdown-it');
const markdownItClass = require('@toycode/markdown-it-class');

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
  eleventyConfig.addWatchTarget('./_tmp/style.css')
  eleventyConfig.addPassthroughCopy({ './_tmp/style.css': './style.css' })
  eleventyConfig.addShortcode('version', function () {
    return now
  })
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);

  const md = markdownIt({linkify: true, html: true});
  md.use(markdownItClass, mapping);
  eleventyConfig.setLibrary('md', md);
};

const fs = require('fs');

function analyzeInfiniteScroll(filePath, lineNumber) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const startLine = Math.max(0, lineNumber - 10);
    const endLine = Math.min(lines.length, lineNumber + 20);
    const context = lines.slice(startLine, endLine).join('\n');

    const hasStoppingMechanism = {
      hasLoadMoreButton: /(loadMore|load_more|load-more|LoadMore|Load More)/.test(context),
      hasPagination: /(pagination|pageSize|totalPages|currentPage)/.test(context),
      hasEndIndicator: /(endOfContent|noMoreContent|isLastPage|hasMore)/.test(context),
      hasScrollLimit: /(scrollLimit|maxScroll|scrollThreshold)/.test(context),
      hasUserControl: /(button|click|onClick|handleClick|userControl)/.test(context)
    };

    return {
      hasStoppingMechanism: Object.values(hasStoppingMechanism).some(v => v),
      details: hasStoppingMechanism
    };
  } catch (error) {
    return {
      hasStoppingMechanism: false,
      details: { error: error.message }
    };
  }
}

module.exports = [
  {
    name: "Infinite Scroll Pattern",
    description: "Implements infinite scrolling without clear stopping cues, prioritizing engagement over user autonomy",
    regex: /(new\s+IntersectionObserver|addEventListener\s*\(\s*['"]scroll['"]|infiniteScroll|loadMore|onScroll|scrollHandler|infinite-scroll|infinite_scroll)/,
    analyze: analyzeInfiniteScroll
  },
];

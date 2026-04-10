/**
 * Typewriter effect composable.
 * Reveals text character-by-character with a blinking cursor.
 */
export function useTypewriter() {
  const displayedText = ref("");
  const isTyping = ref(false);
  let cancel = false;

  async function typewrite(
    fullText: string,
    speed = 18,
    onChar?: (char: string, index: number) => void
  ): Promise<void> {
    cancel = false;
    displayedText.value = "";
    isTyping.value = true;

    // Parse HTML tags so we insert whole tags at once rather than character-by-character
    const tokens = tokenizeHtml(fullText);

    for (let i = 0; i < tokens.length; i++) {
      if (cancel) break;

      const token = tokens[i]!;
      displayedText.value += token;
      onChar?.(token, i);

      // Only delay on visible characters, not HTML tags
      if (!token.startsWith("<")) {
        await sleep(speed);
      }
    }

    isTyping.value = false;
  }

  function stop() {
    cancel = true;
    isTyping.value = false;
  }

  function reset() {
    cancel = true;
    displayedText.value = "";
    isTyping.value = false;
  }

  return {
    displayedText: readonly(displayedText),
    isTyping: readonly(isTyping),
    typewrite,
    stop,
    reset
  };
}

/**
 * Split HTML string into tokens: full tags as single tokens, text chars individually.
 * This ensures HTML tags appear instantly and only visible text is animated.
 */
function tokenizeHtml(html: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end !== -1) {
        tokens.push(html.slice(i, end + 1));
        i = end + 1;
      } else {
        tokens.push(html[i]!);
        i++;
      }
    } else {
      tokens.push(html[i]!);
      i++;
    }
  }
  return tokens;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

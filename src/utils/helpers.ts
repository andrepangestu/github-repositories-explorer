/**
 * Format a number with thousands separators (e.g., 1,234)
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Format a date to a human-readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
};

/**
 * Get the color for a programming language
 */
export const getLanguageColor = (language: string | null): string => {
  if (!language) return "#8B5CF6"; // Default purple

  const colors: Record<string, string> = {
    JavaScript: "#F7DF1E",
    TypeScript: "#3178C6",
    Python: "#3776AB",
    Java: "#ED8B00",
    "C++": "#00599C",
    "C#": "#239120",
    PHP: "#777BB4",
    Ruby: "#CC342D",
    Go: "#00ADD8",
    Rust: "#000000",
    Swift: "#FA7343",
    Kotlin: "#0095D5",
    Dart: "#0175C2",
    HTML: "#E34F26",
    CSS: "#1572B6",
    Vue: "#4FC08D",
    React: "#61DAFB",
    Angular: "#DD0031",
    Svelte: "#FF3E00",
    Shell: "#89E051",
    PowerShell: "#012456",
    Dockerfile: "#384D54",
    YAML: "#CB171E",
    JSON: "#000000",
    Markdown: "#083FA1",
  };

  return colors[language] ?? "#8B5CF6";
};

/**
 * Truncate text to a specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Debounce function to limit API calls
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

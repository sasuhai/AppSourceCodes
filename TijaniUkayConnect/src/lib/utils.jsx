import { clsx } from "clsx"
    import { twMerge } from "tailwind-merge"

    export function cn(...inputs) {
      return twMerge(clsx(inputs))
    }

    export function linkify(text) {
      if (!text) return "";
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:underline font-semibold">${url}</a>`);
    }
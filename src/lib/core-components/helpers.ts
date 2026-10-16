import snarkdown from 'snarkdown';
import sanitizeHtml from 'sanitize-html';

export const rawMarkup = (data: string): { __html: string } => {
  // Sanitize the generated HTML, including URLs created by Markdown syntax.
  // The parser runs identically in Node and browsers without a global DOM.
  return { __html: sanitizeHtml(snarkdown(data), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ['class'],
    },
  }) };
};

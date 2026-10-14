import snarkdown from 'snarkdown';
import dompurify from 'dompurify';

export const rawMarkup = (data: string): { __html: string } => {
  const sanitizer = dompurify.sanitize;
  return { __html: snarkdown(sanitizer(data)) };
};

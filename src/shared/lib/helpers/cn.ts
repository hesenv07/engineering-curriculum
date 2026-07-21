export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassDictionary
  | Array<ClassValue>;

interface ClassDictionary {
  [key: string]: string | number | boolean | null | undefined;
}

function cn(...args: ClassValue[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      classes.push(cn(...arg));
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg[key]) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

export default cn;

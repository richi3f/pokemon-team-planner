export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeSnakeCase(str: string): string {
  return str.split("_").map(capitalize).join(" ");
}

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function toRoman(num: number): string {
  const vals = [10, 9, 5, 4, 1];
  let roman = "";
  let n = num;
  ["X", "IX", "V", "IV", "I"].forEach((sym, i) => {
    while (n >= vals[i]) {
      n -= vals[i];
      roman += sym;
    }
  });
  return roman;
}

export function randomInt(max: number): number {
  return (Math.random() * max) | 0;
}

export function trimSafely(input: string): string {
  // repleace \n with space
  let result = input.replace(/\n/g, ' ');
  // remove duplicate spaces, but not the NBSPs
  result = result.replace(/ +/g, ' ');

  return result;
}
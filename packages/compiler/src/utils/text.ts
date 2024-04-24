export function trimSafely(inputText: string) {
  let result = inputText;

  const leadingNbspCount = (inputText.match(/^\u00A0+/) || [''])[0].length;
  
  // Trim start
  let resultWithTrimmedStart = result.trimStart();
  resultWithTrimmedStart = '\u00A0'.repeat(leadingNbspCount) + result;
  if (resultWithTrimmedStart.length !== result.length) {
    resultWithTrimmedStart = ' ' + result;
  }
  result = resultWithTrimmedStart;

  const trailingNbspCount = (inputText.match(/\u00A0+$/) || [''])[0].length;

  // Trim end
  let resultWithTrimmedEnd = result.trimEnd();
  resultWithTrimmedEnd = result + '\u00A0'.repeat(trailingNbspCount);
  if (resultWithTrimmedEnd.length !== result.length) {
    resultWithTrimmedEnd = result + ' ';
  }
  result = resultWithTrimmedEnd;

  return result;
}

export function trimSafely(inputText: string) {
  let result = inputText;

  const leadingNbspCount = (result.match(/^\u00A0+/) || [''])[0].length;
  
  // Trim start
  let resultWithTrimmedStart = result.trimStart();
  resultWithTrimmedStart = '\u00A0'.repeat(leadingNbspCount) + resultWithTrimmedStart;
  if (resultWithTrimmedStart.length !== result.length) {
    resultWithTrimmedStart = ' ' + resultWithTrimmedStart;
  }
  result = resultWithTrimmedStart;

  const trailingNbspCount = (result.match(/\u00A0+$/) || [''])[0].length;

  // Trim end
  let resultWithTrimmedEnd = result.trimEnd();
  resultWithTrimmedEnd = resultWithTrimmedEnd + '\u00A0'.repeat(trailingNbspCount);
  if (resultWithTrimmedEnd.length !== result.length) {
    resultWithTrimmedEnd = resultWithTrimmedEnd + ' ';
  }
  result = resultWithTrimmedEnd;

  return result;
}

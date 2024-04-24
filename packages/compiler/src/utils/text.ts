export function trimSafely(inputText: string) {
  let outputText = inputText;

  outputText = inputText.trimStart();
  if (outputText.length !== inputText.length) {
    outputText = ' ' + outputText;
  }

  outputText = outputText.trimEnd();
  if (outputText.length !== inputText.length) {
    outputText = outputText + ' ';
  }

  return outputText;
}
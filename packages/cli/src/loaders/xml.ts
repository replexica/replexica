import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ILoader } from "./_types";
import { createLoader } from "./_utils";
// import createFlatLoader from './path-to-flat-loader'; // Adjust the import based on your file structure

// List of tags to skip
const tagsToSkip = ['b', 'i', 'strong', 'em', 'span', 'a'];

export default function createXmlLoader(): ILoader<string, Record<string, any>> {
  // const flatLoader = createFlatLoader();

  return createLoader({
    async pull(locale, input) {
      const parser = new XMLParser({
        ignoreAttributes: true,
        trimValues: true,
        parseNodeValue: true,
        parseAttributeValue: true,
        tagValueProcessor: (tagName, value) => {
          return value; // Return value as is
        }
      });


      const xmlData = parser.parse(input);
      // const flattenedData = await flatLoader.pull(locale, xmlData);
      return xmlData;
    },

    async push(locale, data) {
      // const unflattenedData = await flatLoader.push(locale, data);

      // Convert JSON back to XML
      const builder = new XMLBuilder({
        format: true, // Format the output XML
        ignoreAttributes: true, // Ignore attributes
        suppressEmptyNode: true, // Suppress empty nodes
      });

      // Convert unflattened JSON object to XML string
      const xmlString = builder.build(data);
      return xmlString; // Return the XML string
    }
  });
}

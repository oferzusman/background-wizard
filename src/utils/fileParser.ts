import Papa from "papaparse";
import { XMLParser } from "fast-xml-parser";
import { ProductData } from "@/components/features/products/FileUpload";

export const parseFileContent = async (
  content: string,
  fileType: string
): Promise<ProductData[]> => {
  console.log(`Parsing file content of type: ${fileType}`);
  
  if (fileType === "csv" || fileType === "tsv") {
    const delimiter = fileType === "csv" ? "," : "\t";
    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        delimiter,
        header: true,
        complete: (results) => {
          const parsedData = results.data
            .filter((item: any) => item.title && item.image_url)
            .map((item: any) => ({
              id: item.id || "",
              title: item.title,
              image_url: item.image_url || item["image link"],
              product_type: item.product_type || item["product type"],
            }));
          console.log("Parsed CSV/TSV data:", parsedData);
          resolve(parsedData);
        },
        error: (error) => {
          console.error("Error parsing CSV/TSV:", error);
          reject(error);
        },
      });
    });
  } else if (fileType === "xml") {
    console.log("Parsing XML content");
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: true,
      trimValues: true,
      isArray: (name) => {
        return name === 'item' || name === 'product' || name === 'entry';
      },
    });
    
    try {
      const parsed = parser.parse(content);
      console.log("Raw XML parse result:", parsed);
      
      let products = [];
      
      if (parsed.rss?.channel?.item) {
        products = parsed.rss.channel.item;
      } else if (parsed.products?.product) {
        products = parsed.products.product;
      } else if (parsed.feed?.entry) {
        products = parsed.feed.entry;
      }
      
      console.log("Found products array:", products.length, "items");
      
      const parsedData = products.map((item: any) => ({
        id: item.id || "",
        title: item.title || "",
        image_url: item.image_url || item["image link"] || "",
        product_type: item.product_type || "",
      })).filter(item => item.title && item.image_url);
      
      console.log("Successfully parsed", parsedData.length, "products from XML");
      return parsedData;
    } catch (error) {
      console.error("Error parsing XML:", error);
      throw new Error("Failed to parse XML file. Please check the file format.");
    }
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
};
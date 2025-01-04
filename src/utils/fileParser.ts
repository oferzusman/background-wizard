import Papa from "papaparse";
import { XMLParser } from "fast-xml-parser";
import { ProductData } from "@/components/FileUpload";

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
            .filter((item: any) => item.title && item["image link"]) // Filter out empty rows
            .map((item: any) => ({
              title: item.title,
              "image link": item["image link"],
              product_type: item.product_type || item["product type"],
              id: item.id,
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
      attributeNamePrefix: "@_",
    });
    
    try {
      const parsed = parser.parse(content);
      console.log("Raw XML parse result:", parsed);
      
      // Handle different XML structures
      let products = [];
      if (parsed.products?.product) {
        products = Array.isArray(parsed.products.product) 
          ? parsed.products.product 
          : [parsed.products.product];
      } else if (parsed.feed?.entry) {
        products = parsed.feed.entry;
      } else {
        // Try to find a products array in the parsed object
        const findProducts = (obj: any): any[] => {
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key];
            } else if (typeof obj[key] === 'object') {
              const result = findProducts(obj[key]);
              if (result.length > 0) return result;
            }
          }
          return [];
        };
        products = findProducts(parsed);
      }
      
      console.log("Found products array:", products.length, "items");
      
      const parsedData = products.map((item: any) => ({
        title: item.title || item.name,
        "image link": item.image_link || item.imageLink || item.image || item["image-url"],
        product_type: item.product_type || item.productType || item.category,
        id: item.id || item.productId || item.sku,
      }));
      
      console.log("Parsed XML data:", parsedData);
      return parsedData;
    } catch (error) {
      console.error("Error parsing XML:", error);
      throw new Error("Failed to parse XML file. Please check the file format.");
    }
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
};
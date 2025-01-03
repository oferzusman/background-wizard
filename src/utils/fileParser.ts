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
          const parsedData = results.data.map((item: any) => ({
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
    const parser = new XMLParser();
    const parsed = parser.parse(content);
    const products = Array.isArray(parsed.products.product)
      ? parsed.products.product
      : [parsed.products.product];
    
    const parsedData = products.map((item: any) => ({
      title: item.title,
      "image link": item.image_link || item.imageLink,
      product_type: item.product_type || item.productType,
      id: item.id,
    }));
    console.log("Parsed XML data:", parsedData);
    return parsedData;
  }
  
  throw new Error("Unsupported file type");
};
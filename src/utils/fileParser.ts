
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
            .filter((item: any) => item.title && item["image link"])
            .map((item: any) => ({
              title: item.title,
              "image link": item["image link"],
              product_type: item.product_type || item["product type"],
              id: item.id,
              link: item.link
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
        return name === 'item' || name === 'product' || name === 'entry' || name === 'offer';
      },
      processEntities: true,
      htmlEntities: true,
      ignoreDeclaration: true,
      removeNSPrefix: true,
      textNodeName: "_text"
    });
    
    try {
      const parsed = parser.parse(content);
      console.log("Raw XML parse result:", parsed);
      
      let products = [];
      
      // Try different common XML feed structures
      // Google Merchant Feed structure (rss > channel > item)
      if (parsed.rss?.channel?.item) {
        products = parsed.rss.channel.item;
        console.log("Found Google Merchant Feed structure with", products.length, "items");
      }
      // Generic product structures
      else if (parsed.products?.product) {
        products = parsed.products.product;
      } 
      else if (parsed.feed?.entry) {
        products = parsed.feed.entry;
      }
      // YML Yandex structure
      else if (parsed.yml_catalog?.shop?.offers?.offer) {
        products = parsed.yml_catalog.shop.offers.offer;
      }
      // DataFeedWatch structure
      else if (parsed.offers?.offer) {
        products = parsed.offers.offer;
      }
      else {
        // Try to find a products array in the parsed object
        const findProducts = (obj: any): any[] => {
          if (!obj || typeof obj !== 'object') return [];
          
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              const items = obj[key].filter((item: any) => 
                item && typeof item === 'object' && (
                  item.title || item.name || item.id ||
                  item.image_link || item.link || item.description ||
                  item.picture || item.url
                )
              );
              if (items.length > 0) return items;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              const result = findProducts(obj[key]);
              if (result.length > 0) return result;
            }
          }
          return [];
        };
        products = findProducts(parsed);
        
        if (products.length === 0) {
          console.error("Could not find products array in XML", parsed);
          throw new Error("Could not find products in XML feed. Unsupported format.");
        }
      }
      
      console.log("Found products array:", products.length, "items");
      
      const parsedData = products.map((item: any) => {
        // Handle various naming conventions for product fields
        const title = item.title || item.name || item.product_name || "";
        const imageLink = 
          item.image_link || 
          item.imageLink || 
          item.image || 
          item.picture || 
          item.main_image ||
          item.images?.image || 
          item.images?.main || 
          item.picture_link ||
          "";
        const productType = 
          item.google_product_category || 
          item.product_type || 
          item.productType || 
          item.category || 
          item.categoryId || 
          "";
        const id = item.id || item.productId || item.offer_id || item.sku || item.g_id || "";
        const link = item.link || item.url || item.product_url || "";

        console.log("Processing item:", {
          originalTitle: item.title,
          originalImageLink: item.image_link || item.picture,
          originalLink: item.link || item.url,
          mappedTitle: title,
          mappedImageLink: imageLink,
          mappedLink: link
        });

        return {
          title,
          "image link": imageLink,
          product_type: productType,
          id,
          link
        };
      }).filter(item => {
        const isValid = item.title && item["image link"];
        if (!isValid) {
          console.log("Filtered out invalid item:", item);
        }
        return isValid;
      });
      
      console.log("Successfully parsed", parsedData.length, "products from XML");
      return parsedData;
    } catch (error) {
      console.error("Error parsing XML:", error);
      throw new Error("Failed to parse XML file. Please check the file format.");
    }
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
};

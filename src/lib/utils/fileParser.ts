
import { parse } from 'papaparse';
import { XMLParser } from 'fast-xml-parser';
import { ProductData } from '@/components/features/products/FileUpload';

export const parseFileContent = async (
  content: string,
  fileType: string
): Promise<ProductData[]> => {
  switch (fileType) {
    case 'csv':
    case 'tsv':
      return new Promise((resolve, reject) => {
        parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) {
              reject(new Error('Error parsing CSV/TSV file'));
            } else {
              const data: ProductData[] = results.data.map((item: any) => ({
                title: item.title,
                "image link": item["image link"],
                product_type: item["product_type"],
                id: item.id,
                link: item.link,
              }));
              resolve(data);
            }
          },
        });
      });

    case 'xml':
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
        
        let products = [];
        
        // Try different common XML feed structures
        // Google Merchant Feed structure (rss > channel > item)
        if (parsed.rss?.channel?.item) {
          products = parsed.rss.channel.item;
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
            throw new Error("Could not find products in XML feed. Unsupported format.");
          }
        }
        
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

          return {
            title,
            "image link": imageLink,
            product_type: productType,
            id,
            link
          };
        }).filter(item => item.title && item["image link"]);
        
        return parsedData;
      } catch (error) {
        throw new Error("Failed to parse XML file. Please check the file format.");
      }

    default:
      throw new Error('Unsupported file type');
  }
};

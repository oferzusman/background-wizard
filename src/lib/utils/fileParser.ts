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
                image_url: item["image link"] || item.image_url,
                product_type: item.product_type,
                id: item.id,
                link: item.link,
              }));
              resolve(data);
            }
          },
        });
      });

    case 'xml':
      const parser = new XMLParser();
      const jsonObj = parser.parse(content);
      const products: ProductData[] = jsonObj.products.product.map((item: any) => ({
        title: item.title,
        image_url: item["image link"] || item.image_url,
        product_type: item.product_type,
        id: item.id,
        link: item.link,
      }));
      return products;

    default:
      throw new Error('Unsupported file type');
  }
};
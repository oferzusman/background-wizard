import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductData } from "./FileUpload";

interface ProductFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
  products: ProductData[];
}

export const ProductFilters = ({ onFilterChange, products }: ProductFiltersProps) => {
  const handleFilterChange = (field: string, value: string) => {
    onFilterChange({ [field]: value });
  };

  // Get unique fields from products
  const fields = Array.from(
    new Set(
      products.flatMap((product) =>
        Object.keys(product).filter(
          (key) => key !== "processedImageUrl" && key !== "image link"
        )
      )
    )
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
      {fields.map((field) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>{field}</Label>
          <Input
            id={field}
            placeholder={`Filter by ${field}`}
            onChange={(e) => handleFilterChange(field, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};
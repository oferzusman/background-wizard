import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductData } from "../FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
  products: ProductData[];
  filteredCount: number;
}

export const ProductFilters = ({ onFilterChange, products }: ProductFiltersProps) => {
  const productTypes = Array.from(
    products.reduce((acc, product) => {
      const type = product.product_type?.toString() || "uncategorized";
      acc.set(type, (acc.get(type) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  );

  const fields = Array.from(
    new Set(
      products.flatMap((product) =>
        Object.keys(product).filter(
          (key) => !["processedImageUrl", "image link", "product_type", "link"].includes(key)
        )
      )
    )
  );

  return (
    <div className="space-y-4 p-4 bg-white/50 rounded-lg">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product_type">Product Type</Label>
          <Select
            onValueChange={(value) => onFilterChange({ product_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {productTypes.map(([type, count]) => (
                <SelectItem key={type} value={type}>
                  {type} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {fields.map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{field}</Label>
            <Input
              id={field}
              placeholder={`Filter by ${field}`}
              onChange={(e) => onFilterChange({ [field]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
import { CategoryComponent } from "./item-components/CategoryComponent";

interface Category {
  id: number;
  name: string;
  image: string;
}

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <div className="category-list">
      {categories.map((category) => (
        <CategoryComponent key={category.id} name={category.name} image={category.image} />
      ))}
    </div>
  );
};
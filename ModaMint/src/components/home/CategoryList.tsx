import type { Category } from "../../services/category";
import { CategoryComponent } from "./item-components/CategoryComponent";
import styles from './styles.module.css'


interface CategoryListProps {
  categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <div className={styles.category_list}>
      {categories.map((category) => (
        <CategoryComponent key={category.id} name={category.name} image={category.image} />
      ))}
    </div>
  );
};
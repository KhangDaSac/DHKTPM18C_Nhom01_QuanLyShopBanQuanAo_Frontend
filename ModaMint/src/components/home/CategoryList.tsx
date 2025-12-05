import type { Category } from "@/services/category";
import { CategoryComponent } from "./item-components/CategoryComponent";
import { useNavigate } from "react-router-dom";
import styles from './styles.module.css'


interface CategoryListProps {
  categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: number | undefined) => {
    if (categoryId) {
      // Chuyển hướng đến trang products với categoryId làm query param
      navigate(`/products?categoryId=${categoryId}`);
    }
  };

  return (
    <div className={styles.category_list}>
      {categories.map((category) => (
        <CategoryComponent 
          key={category.id} 
          name={category.name} 
          image={category.image}
          categoryId={category.id}
          onClick={handleCategoryClick}
        />
      ))}
    </div>
  );
};
import styles from './styles.module.css'

interface CategoryComponentProps {
  name: string;
  image: string | undefined;
  categoryId?: number;
  onClick?: (categoryId: number | undefined) => void;
}

export const CategoryComponent: React.FC<CategoryComponentProps> = ({ name, image, categoryId, onClick }) => {
  return (
    <div 
      className={styles.category_item}
      onClick={() => onClick?.(categoryId)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.category_image}>
        <img src={image} alt={name} />
      </div>
      <div className={styles.category_name}>{name}</div>
    </div>
  );
};
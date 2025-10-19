import styles from './styles.module.css'

interface CategoryComponentProps {
  name: string;
  image: string;
}

export const CategoryComponent: React.FC<CategoryComponentProps> = ({ name, image }) => {
  return (
    <div className={styles.category_item}>
      <div className={styles.category_image}>
        <img src={image} alt={name} />
      </div>
      <div className={styles.category_name}>{name}</div>
    </div>

  );
};
import './style.css';

interface CategoryComponentProps {
  name: string;
  image: string;
}

export const CategoryComponent: React.FC<CategoryComponentProps> = ({ name, image }) => {
  return (
    <div className="category-item">
      <div className="category-image">
        <img src={image} alt={name} />
      </div>
      <div className="category-name">{name}</div>
    </div>
  );
};
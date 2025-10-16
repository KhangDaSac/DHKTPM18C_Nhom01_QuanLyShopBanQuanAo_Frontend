import './style.css';

interface BenifitComponentProps {
  title: string;
  description: string;
  image: string;
}

export const BenifitComponent: React.FC<BenifitComponentProps> = ({ title, description, image }) => {
  return (
    <div className="benifit-container">
      <div className="benifit-img-container">
        <img src={image} alt={title} />
      </div>
      <div className="benifit-text-container">
        <p className="benifit-title">{title}</p>
        <p className="benifit-description">{description}</p>
      </div>
    </div>
  );
};
import { BenifitComponent } from './item-components/BenifitComponent';
import './style.css';

interface Benefit {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface SaleBannerProps {
  benefits: Benefit[];
}

const SaleBanner: React.FC<SaleBannerProps> = ({ benefits }) => {
  return (
    <div className='sale-banner-container'>
      <div className='sale-banner-background'>
        <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760195925/slider_1_btuwkl.jpg" alt="Sale Banner" />
      </div>
      <div className='sale-banner-overlay'>
        {benefits.map((benefit) => (
          <BenifitComponent
            key={benefit.id}
            title={benefit.title}
            description={benefit.description}
            image={benefit.image}
          />
        ))}
      </div>
    </div>
  );
};

export default SaleBanner;
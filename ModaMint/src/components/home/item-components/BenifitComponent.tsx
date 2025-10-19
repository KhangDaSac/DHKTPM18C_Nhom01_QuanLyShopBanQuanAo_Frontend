import styles from './styles.module.css'

interface BenifitComponentProps {
  title: string;
  description: string;
  image: string;
}

export const BenifitComponent: React.FC<BenifitComponentProps> = ({ title, description, image }) => {
  return (
  <div className={styles.benifit_container}>
    <div className={styles.benifit_img_container}>
      <img src={image} alt={title} />
    </div>
    <div className={styles.benifit_text_container}>
      <p className={styles.benifit_title}>{title}</p>
      <p className={styles.benifit_description}>{description}</p>
    </div>
  </div>
  );
};
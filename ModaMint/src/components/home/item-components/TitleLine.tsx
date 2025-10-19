import styles from './styles.module.css'

interface TitleLineProps {
  title: string;
}

export const TitleLine: React.FC<TitleLineProps> = ({title}) => {
    return(
    <div className={styles.container_title}>
        <div className={styles.container_line}>
            <span className={styles.title_line}></span>
            <span className={styles.square_title}></span>
        </div>
        <h2 className={styles.text_title_home}>{title}</h2>
        <div className={styles.container_line}>
            <span className={styles.square_title}></span>
            <span className={styles.title_line}></span>
        </div>
    </div>
    )
}
interface TitleLineProps {
  title: string;
}

export const TitleLine: React.FC<TitleLineProps> = ({title}) => {
    return(
        <div className="container-title">
            <div className="container-line">
                <span className="title-line"></span>
                <span className="square-title"></span>
            </div>
                <h2 className="text-title-home">{title}</h2>
            <div className="container-line">
                <span className="square-title"></span>
                <span className="title-line"></span>
            </div>
        </div>
    )
}
import './style.css'; // Import file CSS

const SaleBanner = () => {
  return (
    <div className='sale-banner-container'>
        <div className='sale-banner-background'>
            <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760195925/slider_1_btuwkl.jpg" alt="" />
        </div>
        <div className='sale-banner-overlay'>
            <div className="box">Miễn phí giao hàng</div>
            <div className="box">Đổi trả trong 7 ngày</div>
            <div className="box">Hỗ trợ 24/7</div>
        </div>
    </div>
  );
}

export default SaleBanner;
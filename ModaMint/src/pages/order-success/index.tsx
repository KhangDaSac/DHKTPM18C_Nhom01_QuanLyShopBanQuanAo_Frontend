import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from 'lucide-react';

const OrderSuccessPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state?.orderData;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircleIcon className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h1>
                    <p className="text-gray-600">Cảm ơn bạn đã đặt hàng tại ModaMint</p>
                </div>

                {/* Order Info */}
                {orderData && (
                    <div className="border-t border-b py-6 mb-6 space-y-3">
                        <div className="flex justify-between">
                            <span className="font-medium">Mã đơn hàng:</span>
                            <span className="text-orange-500 font-bold">{orderData.orderCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Tổng tiền:</span>
                            <span className="text-xl font-bold text-orange-500">
                                {formatCurrency(orderData.totalAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Phương thức thanh toán:</span>
                            <span>{orderData.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : orderData.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Địa chỉ giao hàng:</span>
                            <span className="text-right">{orderData.shippingAddress?.fullAddress}</span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/profile/orders')}
                        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-semibold"
                    >
                        Xem đơn hàng
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="w-full border border-orange-500 text-orange-500 py-3 rounded-lg hover:bg-orange-50 font-semibold"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>

                {/* Note */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>Lưu ý:</strong> Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng. 
                        Vui lòng kiểm tra email hoặc số điện thoại đã đăng ký.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;

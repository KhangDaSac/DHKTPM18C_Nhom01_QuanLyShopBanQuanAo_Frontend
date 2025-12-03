import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authenticationService } from "@/services/authentication";
import { useAuth } from "@/contexts/authContext";
import { getRolesFromToken, getUserInfoFromToken } from "@/utils/apiAuthUtils";
import styles from "./style.module.css";

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Thêm ref để đảm bảo chỉ xử lý một lần
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Nếu đã xử lý rồi thì không làm gì cả
    if (hasProcessedRef.current) {
      return;
    }

    const handleGoogleCallback = async () => {
      // Đánh dấu ngay lập tức để tránh race condition
      hasProcessedRef.current = true;
      // Lấy authorization code từ URL
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      // Kiểm tra nếu Google trả về lỗi
      if (error) {
        setStatus("error");
        setErrorMessage("Đăng nhập Google thất bại. Vui lòng thử lại.");
        toast.error("Đăng nhập Google thất bại");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
        return;
      }

      // Kiểm tra nếu không có code
      if (!code) {
        setStatus("error");
        setErrorMessage("Không nhận được mã xác thực từ Google.");
        toast.error("Không nhận được mã xác thực từ Google");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
        return;
      }

      try {
        // Gọi API để trao đổi code lấy token
        const result = await authenticationService.authenticateWithGoogle(code);

        if (result.success && result.data) {
          setStatus("success");
          toast.success("Đăng nhập Google thành công!");

          // Lấy thông tin user
          let userData = null;
          try {
            // Tạm thời lưu token vào localStorage để có thể gọi API
            const tempAuthData = {
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
            };
            localStorage.setItem("authData", JSON.stringify(tempAuthData));

            const userResult = await authenticationService.getCurrentUser();

            if (userResult.success && userResult.data) {
              userData = userResult.data;
            } else {
              // Lấy user info từ JWT token nếu API thất bại
              const tokenInfo = getUserInfoFromToken(result.data.accessToken);

              console.log("token info", tokenInfo);

              userData = {
                id: tokenInfo?.id || "unknown-id",
                username: tokenInfo?.username || "",
                email: tokenInfo?.email || "",
                firstName: "",
                lastName: "",
                phone: "",
                dob: "",
              };
            }
          } catch (error) {
            console.error("Error getting user data:", error);
            // Lấy user info từ JWT token khi có lỗi
            const tokenInfo = getUserInfoFromToken(result.data.accessToken);

            userData = {
              id: tokenInfo?.id || "unknown-id",
              username: tokenInfo?.username || "",
              email: tokenInfo?.email || "",
              firstName: "",
              lastName: "",
              phone: "",
              dob: "",
            };
          }

          // Lưu thông tin đăng nhập vào context
          login(
            {
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
            },
            userData
          );

          // Lấy roles từ token để redirect đúng trang
          const roles = getRolesFromToken(result.data.accessToken);
          const isAdmin = roles.includes("ADMIN");

          // Redirect dựa trên role
          setTimeout(() => {
            if (isAdmin) {
              navigate("/dashboard", { replace: true });
            } else {
              navigate("/", { replace: true });
            }
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage(result.message || "Đăng nhập Google thất bại");
          toast.error(result.message || "Đăng nhập Google thất bại");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error("Google auth callback error:", error);
        setStatus("error");
        setErrorMessage("Có lỗi xảy ra trong quá trình đăng nhập");
        toast.error("Có lỗi xảy ra trong quá trình đăng nhập");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className={styles.callback}>
      <div className={styles.callback__container}>
        {status === "processing" && (
          <>
            <div className={styles.callback__spinner}></div>
            <h2 className={styles.callback__title}>Đang xử lý đăng nhập...</h2>
            <p className={styles.callback__message}>
              Vui lòng đợi trong giây lát
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className={styles.callback__success}>✓</div>
            <h2 className={styles.callback__title}>Đăng nhập thành công!</h2>
            <p className={styles.callback__message}>Đang chuyển hướng...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className={styles.callback__error}>✗</div>
            <h2 className={styles.callback__title}>Đăng nhập thất bại</h2>
            <p className={styles.callback__message}>{errorMessage}</p>
            <p className={styles.callback__redirect}>
              Đang chuyển về trang đăng nhập...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

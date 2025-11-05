const API_URL = "https://683089a56205ab0d6c397cf2.mockapi.io/products"; // thay bằng URL MockAPI của bạn

export const getProducts = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const getProductById = async (id : number) => {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
};

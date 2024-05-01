const BASE_URL = "http://65.2.30.133:5000/api/v1"

/*
    Address Routes
*/
export const addAddress = `${BASE_URL}/address`;
export const getAddressList = `${BASE_URL}/address`;
export const getAddressDetails = `${BASE_URL}/address`;
export const updateAddress = `${BASE_URL}/address`;
export const deleteAddress = `${BASE_URL}/address`;
export const getUserAddress = `${BASE_URL}/address/user`;

/*
    Brand Routes
*/
export const getBrandList = `${BASE_URL}/brands`;
export const addBrand = `${BASE_URL}/brands`;
export const updateBrandLogo = `${BASE_URL}/brands`;
export const deleteBrand = `${BASE_URL}/brands`;

/*
    Card Routes
*/
export const addCard = `${BASE_URL}/cards`;
export const getCardsList = `${BASE_URL}/cards`;
export const getCardDetails = `${BASE_URL}/cards`;
export const updateCard = `${BASE_URL}/cards`;
export const deleteCard = `${BASE_URL}/cards`;

/*
    Cart Routes
*/
export const getCart = `${BASE_URL}/cart`;
export const addItemToCart = `${BASE_URL}/cart/add`;
export const removeItemToCart = `${BASE_URL}/cart/remove`;
export const updateItemToCart = `${BASE_URL}/cart/update`;

/*
    Category Routes
*/
export const getCategoryList = `${BASE_URL}/category`;
export const addCategory = `${BASE_URL}/category`;
export const deleteCategory = `${BASE_URL}/category`;

/*
    Coupon Routes
*/
export const getAvailableCouponList = `${BASE_URL}/coupons/available`;
export const getCouponDetails = `${BASE_URL}/coupons`;
export const useCoupon = `${BASE_URL}/coupons`;
export const getAllCouponList = `${BASE_URL}/coupons`;
export const addCoupon = `${BASE_URL}/coupons`;
export const updateCoupon = `${BASE_URL}/coupons`;
export const deleteCoupon = `${BASE_URL}/coupons`;

/*
    Order Routes
*/
export const addOrderItem = `${BASE_URL}/orders`;
export const getMyOrders = `${BASE_URL}/orders`;
export const getOrderDetails = `${BASE_URL}/orders`;
export const updateOrder = `${BASE_URL}/orders`;
export const deleteOrder = `${BASE_URL}/orders`;
export const getUserOrder = `${BASE_URL}/orders/user`;
export const deleteUserOrder = `${BASE_URL}/orders/user`;

/*
    Product Routes
*/
export const getProductList = `${BASE_URL}/products`;
export const getProductDetails = `${BASE_URL}/products`;
export const createProduct = `${BASE_URL}/products`;
export const editProduct = `${BASE_URL}/products`;
export const deleteProduct = `${BASE_URL}/products`;
export const updateProductImages = `${BASE_URL}/products`;

/*
    Review Routes
*/
export const getProductReviews = `${BASE_URL}/reviews`;
export const addProductReviews = `${BASE_URL}/reviews`;
export const getProductReviewDetails = `${BASE_URL}/reviews`;
export const updateProductReview = `${BASE_URL}/reviews`;
export const deleteProductReview = `${BASE_URL}/reviews`;

/*
    Sub-Category Routes
*/
export const getSubCategoryList = `${BASE_URL}/sub-category`;
export const addSubCategory = `${BASE_URL}/sub-category/c`;
export const deleteSubCategory = `${BASE_URL}/sub-category`;

/*
    User Routes
*/
export const registerUser = `${BASE_URL}/user/register`;
export const loginUser = `${BASE_URL}/user/login`;
export const loginAdmin = `${BASE_URL}/user/login/admin`;
export const getSelfDetails = `${BASE_URL}/user/me`;
export const updateSelfDetails = `${BASE_URL}/user/me`;
export const logoutUser = `${BASE_URL}/user/logout`;
export const refreshAccessToken = `${BASE_URL}/user/refresh-token`;
export const changeUserPassword = `${BASE_URL}/user/change-password`;
export const getUserList = `${BASE_URL}/user`;
export const getUserDetails = `${BASE_URL}/user`;

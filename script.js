$(document).ready(function() {
    // API Endpoints
    const PRODUCTS_API = "https://67e5696818194932a585f3dc.mockapi.io/CuaHangDoTheThao";
    const ORDERS_API = "https://123abc456def.mockapi.io/orders";
    
    // Global Variables
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let products = [];
    
    // Initialize the page
    init();
    
    function init() {
        // Check if admin page
        if (window.location.pathname.includes("admin.html")) {
            initAdmin();
        } else {
            initUser();
        }
    }
    
    /* ========== USER FUNCTIONALITY ========== */
    function initUser() {
        loadProducts();
        renderCart();
        setupEventListeners();
    }
    
    function loadProducts() {
        showLoading("#product-list");
        
        $.ajax({
            url: PRODUCTS_API,
            method: "GET",
            success: function(data) {
                products = Array.isArray(data) ? data : [];
                renderProducts(products);
            },
            error: function(xhr, status, error) {
                showError("#product-list", "Lỗi khi tải sản phẩm. Vui lòng thử lại sau.");
            }
        });
    }
    
    function renderProducts(productsToRender) {
        const $productList = $("#product-list");
        $productList.empty();
        
        if (productsToRender.length === 0) {
            $productList.html('<div class="col-12 text-center py-5"><h5>Không có sản phẩm nào</h5></div>');
            return;
        }
        
        productsToRender.forEach(product => {
            const productCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="product-card">
                        <img src="${product.image || 'https://via.placeholder.com/300'}" 
                             class="product-img" 
                             alt="${product.title || 'Sản phẩm'}">
                        <div class="product-body">
                            <h5 class="product-title">${product.title || 'Không có tên'}</h5>
                            <div class="product-rating mb-2">
                                ${renderRating(product.rating || 0)}
                            </div>
                            <p class="product-price">${formatPrice(product.price || 0)}</p>
                            <button class="btn btn-primary w-100 add-to-cart" 
                                    data-id="${product.id}"
                                    data-name="${product.title || 'Không có tên'}"
                                    data-price="${product.price || 0}"
                                    data-image="${product.image || ''}">
                                <i class="fas fa-cart-plus me-2"></i> Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>`;
            $productList.append(productCard);
        });
    }
    
    function renderRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(price * 1000);
    }
    
    function renderCart() {
        const $cartItems = $("#cart-items");
        const $cartTotal = $("#cart-total");
        const $cartCount = $("#cart-count");
        let total = 0;
        
        $cartItems.empty();
        
        if (cart.length === 0) {
            $cartItems.html('<tr><td colspan="5" class="text-center py-4">Giỏ hàng trống</td></tr>');
            $cartTotal.text(formatPrice(0));
            $cartCount.text("0").addClass("d-none");
            return;
        }
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartRow = `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${item.image || 'https://via.placeholder.com/80'}" 
                                 class="cart-item-img me-3" 
                                 alt="${item.name}">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>${formatPrice(item.price)}</td>
                    <td>
                        <div class="input-group" style="width: 120px;">
                            <button class="btn btn-outline-secondary decrease-qty" 
                                    type="button" 
                                    data-index="${index}">-</button>
                            <input type="text" class="form-control text-center qty-input" 
                                   value="${item.quantity}" readonly>
                            <button class="btn btn-outline-secondary increase-qty" 
                                    type="button" 
                                    data-index="${index}">+</button>
                        </div>
                    </td>
                    <td>${formatPrice(itemTotal)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm remove-item" 
                                data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            $cartItems.append(cartRow);
        });
        
        $cartTotal.text(formatPrice(total));
        $cartCount.text(cart.reduce((sum, item) => sum + item.quantity, 0)).removeClass("d-none");
        saveCart();
    }
    
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    
    function setupEventListeners() {
        // Add to cart
        $(document).on("click", ".add-to-cart", function() {
            const product = {
                id: $(this).data("id"),
                name: $(this).data("name"),
                price: parseFloat($(this).data("price")) || 0,
                image: $(this).data("image") || '',
                quantity: 1
            };
            
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push(product);
            }
            
            renderCart();
            showToast("Đã thêm vào giỏ hàng");
        });
        
        // Remove from cart
        $(document).on("click", ".remove-item", function() {
            const index = $(this).data("index");
            cart.splice(index, 1);
            renderCart();
        });
        
        // Increase quantity
        $(document).on("click", ".increase-qty", function() {
            const index = $(this).data("index");
            cart[index].quantity++;
            renderCart();
        });
        
        // Decrease quantity
        $(document).on("click", ".decrease-qty", function() {
            const index = $(this).data("index");
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1);
            }
            renderCart();
        });
        
        // Search products
        $("#search-btn").click(searchProducts);
        $("#search-input").keypress(function(e) {
            if (e.which === 13) searchProducts();
        });
        
        // Sort products
        $("#sort-select").change(sortProducts);
        
        // Checkout
        $("#checkout-btn").click(checkout);
        
        // Continue shopping
        $("#continue-shopping").click(function() {
            $('html, body').animate({
                scrollTop: $("#products").offset().top
            }, 500);
        });
    }
    
    function searchProducts() {
        const searchTerm = $("#search-input").val().toLowerCase();
        
        if (!searchTerm) {
            renderProducts(products);
            return;
        }
        
        const filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) || 
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
        
        renderProducts(filteredProducts);
    }
    
    function sortProducts() {
        const sortValue = $("#sort-select").val();
        let sortedProducts = [...products];
        
        switch(sortValue) {
            case "price-asc":
                sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case "price-desc":
                sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case "name-asc":
                sortedProducts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case "name-desc":
                sortedProducts.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                break;
            default:
                // Do nothing for default
        }
        
        renderProducts(sortedProducts);
    }
    
    function checkout() {
        if (cart.length === 0) {
            showToast("Giỏ hàng trống", "warning");
            return;
        }
        
        const orderData = {
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: "pending"
        };
        
        $.ajax({
            url: ORDERS_API,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(orderData),
            success: function() {
                showToast("Đặt hàng thành công", "success");
                cart = [];
                renderCart();
            },
            error: function() {
                showToast("Lỗi khi đặt hàng", "danger");
            }
        });
    }
    
    /* ========== ADMIN FUNCTIONALITY ========== */
    function initAdmin() {
        if (localStorage.getItem("isAdminLoggedIn") === "true") {
            showAdminDashboard();
            loadAdminProducts();
        } else {
            showLoginForm();
        }
        
        setupAdminEventListeners();
    }
    
    function showLoginForm() {
        $("#login-section").show();
        $("#admin-dashboard").hide();
    }
    
    function showAdminDashboard() {
        $("#login-section").hide();
        $("#admin-dashboard").show();
    }
    
    function loadAdminProducts() {
        showLoading("#admin-product-list");
        
        $.ajax({
            url: PRODUCTS_API,
            method: "GET",
            success: function(data) {
                products = Array.isArray(data) ? data : [];
                renderAdminProducts(products);
            },
            error: function() {
                showError("#admin-product-list", "Lỗi khi tải sản phẩm");
            }
        });
    }
    
    function renderAdminProducts(products) {
        const $tableBody = $("#admin-product-list");
        $tableBody.empty();
        
        if (products.length === 0) {
            $tableBody.html('<tr><td colspan="6" class="text-center py-4">Không có sản phẩm nào</td></tr>');
            return;
        }
        
        products.forEach(product => {
            const row = `
                <tr>
                    <td>
                        <img src="${product.image || 'https://via.placeholder.com/60'}" 
                             class="product-image-thumbnail" 
                             alt="${product.title || ''}">
                    </td>
                    <td>${product.title || 'Không có tên'}</td>
                    <td>${formatPrice(product.price || 0)}</td>
                    <td>${product.category || 'Chưa phân loại'}</td>
                    <td>${formatDate(product.createdAt || new Date().toISOString())}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-product me-2" 
                                data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" 
                                data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            $tableBody.append(row);
        });
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }
    
    function setupAdminEventListeners() {
        // Login form
        $("#login-form").submit(function(e) {
            e.preventDefault();
            const username = $("#username").val();
            const password = $("#password").val();
            
            if (username === "1" && password === "1") {
                localStorage.setItem("isAdminLoggedIn", "true");
                showAdminDashboard();
                loadAdminProducts();
            } else {
                showToast("Tên đăng nhập hoặc mật khẩu không đúng", "danger");
            }
        });
        
        // Logout
        $("#logout-btn").click(function() {
            localStorage.removeItem("isAdminLoggedIn");
            showLoginForm();
        });
        
        // Save product button
        $("#save-product-btn").click(function() {
            $("#add-product-form").submit();
        });
        
        // Add/edit product form
        $("#add-product-form").submit(function(e) {
            e.preventDefault();
            const productId = $("#product-id").val();
            const productData = {
                title: $("#product-name").val(),
                price: parseFloat($("#product-price").val()) || 0,
                category: $("#product-category").val(),
                description: $("#product-description").val(),
                image: $("#product-image").val() || 'https://via.placeholder.com/300',
                createdAt: new Date().toISOString()
            };
            
            if (!productData.title) {
                showToast("Vui lòng nhập tên sản phẩm", "warning");
                return;
            }
            
            const method = productId ? "PUT" : "POST";
            const url = productId ? `${PRODUCTS_API}/${productId}` : PRODUCTS_API;
            
            $.ajax({
                url: url,
                method: method,
                contentType: "application/json",
                data: JSON.stringify(productData),
                success: function() {
                    showToast(productId ? "Cập nhật thành công" : "Thêm sản phẩm thành công", "success");
                    loadAdminProducts();
                    $("#productModal").modal("hide");
                },
                error: function() {
                    showToast("Đã xảy ra lỗi", "danger");
                }
            });
        });
        
        // Edit product
        $(document).on("click", ".edit-product", function() {
            const productId = $(this).data("id");
            const product = products.find(p => p.id === productId);
            
            if (product) {
                $("#product-id").val(product.id);
                $("#product-name").val(product.title || '');
                $("#product-price").val(product.price || 0);
                $("#product-category").val(product.category || '');
                $("#product-description").val(product.description || '');
                $("#product-image").val(product.image || '');
                
                const productModal = new bootstrap.Modal(document.getElementById('productModal'));
                productModal.show();
            }
        });
        
        // Delete product
        $(document).on("click", ".delete-product", function() {
            const productId = $(this).data("id");
            
            if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                $.ajax({
                    url: `${PRODUCTS_API}/${productId}`,
                    method: "DELETE",
                    success: function() {
                        showToast("Xóa sản phẩm thành công", "success");
                        loadAdminProducts();
                    },
                    error: function() {
                        showToast("Lỗi khi xóa sản phẩm", "danger");
                    }
                });
            }
        });
        
        // Reset form when modal is closed
        $('#productModal').on('hidden.bs.modal', function () {
            $("#add-product-form")[0].reset();
            $("#product-id").val("");
        });
    }
    
    /* ========== UTILITY FUNCTIONS ========== */
    function showLoading(selector) {
        $(selector).html(`
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Đang tải dữ liệu...</p>
            </div>
        `);
    }
    
    function showError(selector, message) {
        $(selector).html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-2x text-danger mb-3"></i>
                <h5>${message}</h5>
                <button class="btn btn-primary mt-3 retry-btn">Thử lại</button>
            </div>
        `);
        
        $(document).on("click", ".retry-btn", function() {
            if (window.location.pathname.includes("admin.html")) {
                loadAdminProducts();
            } else {
                loadProducts();
            }
        });
    }
    
    function showToast(message, type = "success") {
        const toast = $(`
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `);
        
        $("#toast-container").append(toast);
        const bsToast = new bootstrap.Toast(toast[0]);
        bsToast.show();
        
        toast.on("hidden.bs.toast", function() {
            $(this).remove();
        });
    }
});
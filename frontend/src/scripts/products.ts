// Define category interface
interface Category {
    id: number;
    name: string;
}

// Define cart Item interface
interface CartItem {
    id: string,
    productId: number,
    productName: string,
    unitPrice: number,
    quantity: number,
    totalPrice: number,
    userId: string
}

// Define product interface
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    imageUrl: string;
    createdAt: string;
    modifiedAt: string;
    inStock: () => string;
}

export class App {
    private categories: Category[] = [];
    private products: Product[] = [];
    private cartItems: CartItem[] = [];

    constructor() {
        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    }

    private async init() {
        this.fetchCategories();
        this.fetchProducts();
        this.fetchCartItems();
        this.displayCartItemsCount();
        this.setupEventListeners();
    }

    private async fetchCategories(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/categories');

            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }

            const categoriesData = await response.json();

            if (Array.isArray(categoriesData)) {
                this.categories = categoriesData.map((category: any) => ({
                    id: category.id,
                    name: category.name
                }));

                this.renderCategories();
            } else {
                throw new Error('Invalid categories data format');
            }
        } catch (error) {
            console.log('Error fetching categories: ', error);
        }
    }

    private renderCategories(): void {
        const select = document.getElementById('categories') as HTMLSelectElement;
        select.innerHTML = '';

        const placeholderOption = document.createElement('option');
        placeholderOption.value = '0';
        placeholderOption.textContent = 'Select Category';
        // placeholderOption.disabled = true;
        placeholderOption.selected = true;

        select.appendChild(placeholderOption);

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = "" + category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    private async fetchProducts(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/products');

            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }

            const productsData = await response.json();

            if (Array.isArray(productsData)) {
                this.products = productsData.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    categoryId: product.categoryId,
                    imageUrl: product.imageUrl,
                    createdAt: product.createdAt,
                    modifiedAt: product.modifiedAt,
                    inStock: function () {
                        return product.stock > 0 ? 'in stock' : 'out of stock';
                    }
                }));

                this.renderProducts(this.products);
            } else {
                throw new Error('Invalid products data format');
            }
        } catch (error) {
            console.log('Error fetching products: ', error);
        }
    }

    private async fetchCartItems(): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/cartItems/`);

            if (!response.ok) {
                throw new Error('Failed to fetch cart items for this user')
            }

            const cartItems: CartItem[] = await response.json();

            if (Array.isArray(cartItems)) {
                this.cartItems = cartItems.map((cartItem: CartItem) => ({
                    id: cartItem.id,
                    productId: cartItem.productId,
                    productName: cartItem.productName,
                    unitPrice: cartItem.unitPrice,
                    quantity: cartItem.quantity,
                    totalPrice: cartItem.totalPrice,
                    userId: cartItem.userId
                }));

                this.displayCartItemsCount();
            } else {
                throw new Error('Invalid cart items data format');
            }
        } catch (error) {
            console.log('Error fetching cart items: ', error);
        }
    }

    private displayCartItemsCount(): void {
        const itemCount = this.cartItems.length;
        const cartCountSpan = document.getElementById('cart-count') as HTMLSpanElement;

        if (itemCount) {
            cartCountSpan.textContent = itemCount.toString();
        } else {
            cartCountSpan.textContent = "0";
        }
    }

    private renderProducts(products: Product[]): void {
        const productsDiv = document.getElementById('products') as HTMLDivElement;
        productsDiv.innerHTML = ''; // Clear existing cards

        products.forEach(product => {
            const card = this.createProductCard(product);
            productsDiv.appendChild(card);
        });
    }

    private createProductCard(product: Product): HTMLDivElement {
        const card = document.createElement('div');
        card.className = 'product';

        const imgDiv = document.createElement('div');
        imgDiv.className = 'product-img';

        imgDiv.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
        `;

        const inOrOutOfStock = product.inStock().split(' ').join('-');

        const moreInfoBtn = document.createElement('button');
        moreInfoBtn.textContent = 'more info';
        moreInfoBtn.classList.add('more-info-btn');
        moreInfoBtn.dataset.id = "" + product.id;
        moreInfoBtn.addEventListener('click', () => {
            window.location.href = `./product.html?id=${product.id}`;
        });

        const addToCartBtn = document.createElement('button');
        addToCartBtn.textContent = 'add to cart';
        addToCartBtn.classList.add('add-to-cart-btn');
        addToCartBtn.dataset.id = "" + product.id;
        addToCartBtn.addEventListener('click', () => {
            this.addToCart(product);
            this.displayCartItemsCount();
            this.showAddedToCartModal();
        });

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');

        buttonsDiv.appendChild(moreInfoBtn);
        buttonsDiv.appendChild(addToCartBtn);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'product-details';
        detailsDiv.innerHTML = `
            <h4 class="name">${product.name}</h4>
            <p class="description">${product.description}</p>
            <p class="price">$ ${product.price}</p>
            <p class="${inOrOutOfStock}">${product.inStock()}</p>
        `;

        // Add event listener to more-info button
        // detailsDiv.querySelector('.more-info-btn')?.addEventListener('click', () => {
        //     window.location.href = `./product.html?id=${product.id}`;
        // });

        detailsDiv.appendChild(buttonsDiv);

        card.appendChild(imgDiv);
        card.appendChild(detailsDiv);

        return card;
    }

    private async addToCart(product: Product): Promise<CartItem> {
        try {
            const cartItem = {
                id: "" + (parseInt(this.cartItems[this.cartItems.length - 1].id) + 1),
                productId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity: 1, // Default quantity
                totalPrice: product.price,
                userId: "1"
            };

            const response = await fetch(`http://localhost:3000/cartItems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cartItem)
            });

            if (!response.ok) {
                throw new Error('Failed to create cart item');
            }

            const createdCartItem: CartItem = await response.json();

            if (createdCartItem && typeof createdCartItem === 'object') {
                this.cartItems.push(cartItem);
                this.displayCartItemsCount();
                return createdCartItem;
            } else {
                throw new Error('Invalid cartItem data format');
            }
        } catch (error) {
            // console.error('Error creating product: ', error);
            throw error;
        }
    }

    // Setup event listeners
    private setupEventListeners(): void {
        const select = document.getElementById('categories') as HTMLSelectElement;
        select?.addEventListener('change', () => {
            const selectedCategory = select.value;
            this.filterProductsByCategory(selectedCategory);
        });

        const searchInput = document.getElementById('search') as HTMLInputElement;
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm === '') {
                this.renderProducts(this.products);
            } else {
                this.filterProductsByName(searchTerm);
            }
        });
    }

    private filterProductsByCategory(category: string): void {
        const categoryValue = category === '0' ? null : parseInt(category, 10);
        const filteredProducts = categoryValue === null ? this.products : this.products.filter(product => product.categoryId === categoryValue);
        this.renderProducts(filteredProducts);
    }

    private filterProductsByName(name: string): void {
        const filteredProducts = this.products.filter(product => product.name.toLowerCase().includes(name.toLowerCase()));
        if (filteredProducts.length > 0) {
            this.renderProducts(filteredProducts);
        } else {
            const productsDiv = document.getElementById('products') as HTMLDivElement;
            productsDiv.innerHTML = '';
            productsDiv.innerHTML = `<p class="no-match-found">no match found for "${name}"</p>`;
        }
    }

    private showAddedToCartModal(): void {
        const modal = document.getElementById('add-to-cart-modal') as HTMLDivElement;
        modal.style.display = 'block';

        const closeButton = document.getElementById('close-add-to-cart-modal-btn') as HTMLElement;

        closeButton.onclick = () => this.closeAddedToCartModal();
    }

    private closeAddedToCartModal(): void {
        const modal = document.getElementById('add-to-cart-modal') as HTMLDivElement;
        modal.style.display = 'none';
    }
}

// Initialize app
new App();

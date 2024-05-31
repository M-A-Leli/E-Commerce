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

export class App {
    private relatedProducts: Product[] = [];
    private product!: Product;
    private categories: { id: number; name: string; }[] = [];
    private cartItems: CartItem[] = [];

    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    private async init(): Promise<void> {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            await this.fetchProductById(parseInt(productId));
            await this.fetchRelatedProducts();
            await this.fetchCartItems();
        } else {
            console.error('Product ID not found in URL');
        }
    }

    private async fetchProductById(productId: number): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/products/${productId}`);
    
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
    
            const productData = await response.json();
    
            if (productData && typeof productData === 'object') {
                this.product = this.mapProductData(productData);
                this.renderProduct(this.product);
            } else {
                throw new Error('Invalid product data format');
            }
        } catch (error) {
            console.error('Error fetching product: ', error);
        }
    }

    private mapProductData(productData: any): Product {
        return {
            id: productData.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            categoryId: productData.categoryId,
            imageUrl: productData.imageUrl,
            createdAt: productData.createdAt,
            modifiedAt: productData.modifiedAt,
            inStock: () => productData.stock > 0 ? 'in stock' : 'out of stock'
        };
    }
    
    private renderProduct(product: Product): void {
        const productDiv = document.querySelector('#product .container') as HTMLDivElement;
        if (productDiv) {
            productDiv.innerHTML = ''; // Clear existing content
            const card = this.createProductCard(product);
            productDiv.appendChild(card);
        } else {
            console.error('Product container not found');
        }
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
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="${inOrOutOfStock}">${product.inStock()}</p>
        `;

        // detailsDiv.querySelector('.more-info-btn')?.addEventListener('click', () => {
        //     window.location.href = `./product.html?id=${product.id}`;
        // });

        detailsDiv.appendChild(buttonsDiv);

        card.appendChild(imgDiv);
        card.appendChild(detailsDiv);

        return card;
    }

    private async fetchRelatedProducts(): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/products?categoryId=${this.product.categoryId}&_limit=4`);

            if (!response.ok) {
                throw new Error('Failed to fetch related products');
            }

            const productsData = await response.json();

            if (Array.isArray(productsData)) {
                // Filter out the current product
                const filteredProducts = productsData.filter((product: Product) => product.id !== this.product.id);
                this.relatedProducts = filteredProducts.slice(0, 3).map(this.mapProductData);
                this.renderRelatedProducts(this.relatedProducts);
            } else {
                throw new Error('Invalid products data format');
            }
        } catch (error) {
            console.error('Error fetching related products: ', error);
        }
    }

    private renderRelatedProducts(products: Product[]): void {
        const relatedProductsDiv = document.querySelector('#related-products #products') as HTMLDivElement;
        relatedProductsDiv.innerHTML = ''; // Clear existing cards
        products.forEach(product => {
            const card = this.createProductCard(product);
            relatedProductsDiv.appendChild(card);
        });
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
                
                //! this.displayCartItems(this.cartItems);
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

        if(itemCount) {
            cartCountSpan.textContent = itemCount.toString();
        } else {
            cartCountSpan.textContent = "0";
        }
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
                userId: '1'
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

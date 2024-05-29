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
    private relatedProducts: Product[] = [];
    private product!: Product;
    private categories: { id: number; name: string; }[] = [];

    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    private async init(): Promise<void> {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            await this.fetchProductById(parseInt(productId));
            await this.fetchRelatedProducts();
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

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'product-details';
        detailsDiv.innerHTML = `
            <h4 class="name">${product.name}</h4>
            <p class="description">${product.description}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="in-stock">${product.inStock()}</p>
            <button class="more-info-btn" data-id="${product.id}">More Info</button>
        `;

        detailsDiv.querySelector('.more-info-btn')?.addEventListener('click', () => {
            window.location.href = `./product.html?id=${product.id}`;
        });

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
}

// Initialize app
new App();

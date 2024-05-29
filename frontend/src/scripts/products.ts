// Define category interface
interface Category {
    id: number;
    name: string;
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

    constructor() {
        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    }

    private async init() {
        this.fetchCategories();
        this.fetchProducts();
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
            console.log('Error fetching products: ', error)
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

        // const img = document.createElement('img');
        // img.setAttribute('src', product.imageUrl);
        // img.setAttribute('alt', product.name);

        // imgDiv.appendChild(img);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'product-details';
        detailsDiv.innerHTML = `
            <h4 class="name">${product.name}</h4>
            <p class="description">${product.description}</p>
            <p class="price">$ ${product.price}</p>
            <p class="in-stock">${product.inStock()}</p>
            <button class="more-info-btn" data-id="${product.id}">more info</button>
        `;

        // Add event listener to more-info button
        detailsDiv.querySelector('.more-info-btn')?.addEventListener('click', () => {
            window.location.href = `./product.html?id=${product.id}`;
        });

        card.appendChild(imgDiv);
        card.appendChild(detailsDiv);

        return card;
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
}

// Initialize app
new App();

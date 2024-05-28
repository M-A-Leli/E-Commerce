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
                    modifiedAt: product.modifiedAt
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
        const tableBody = document.querySelector('#products tbody') as HTMLTableSectionElement;
        tableBody.innerHTML = ''; // Clear existing content
        products.forEach(product => {
            const row = this.createProductRow(product);
            tableBody.appendChild(row);
        });
    }

    private createProductRow(product: Product): HTMLTableRowElement {
        const row = document.createElement('tr');
        row.className = 'product-row';

        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>
            <button id="update-product-btn" data-id="${product.id}">Update</button>
            <button id="delete-product-btn" data-id="${product.id}">Delete</button>
        </td>
        `;

        return row;
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

        const newProductBtn = document.getElementById('new-product-btn') as HTMLButtonElement;
        newProductBtn.addEventListener('click', () => {
            this.showNewProductForm();
        });
        
        const newProductSubmitBtn = document.getElementById('new-product-submit-btn') as HTMLButtonElement;
        newProductSubmitBtn.addEventListener('click', () => {
            // this.createProduct();
            this.hideNewProductForm();
        }); 

        const updateProductBtn = document.getElementById('update-product-btn') as HTMLButtonElement;
        updateProductBtn?.addEventListener('click', () => {
            this.showUpdateProductForm();
        });

        const updateProductSubmitBtn = document.getElementById('update-product-submit-btn') as HTMLButtonElement;
        updateProductSubmitBtn.addEventListener('click', () => {
            this.updateProduct();
            this.hideUpdateProductForm();
        });

        const deleteProductBtn = document.getElementById('delete-product-btn') as HTMLButtonElement;
        deleteProductBtn?.addEventListener('click', () => {
            // this.showDeleteModal();
        });

        const deleteProductSubmitBtn = document.getElementById('delete-product-submit-btn') as HTMLButtonElement;
        deleteProductSubmitBtn.addEventListener('click', () => {
            // this.deleteProduct();
        });

        // !
        // const tableBody = document.querySelector('#products tbody');
        // if (tableBody) {
        //     tableBody.addEventListener('click', (event) => {
        //         if ((event.target as HTMLElement).classList.contains('delete-btn')) {
        //             this.handleDeleteButtonClick(event);
        //         }
        //     });
        // }

        // const tableBody = document.querySelector('#product-table tbody');
        // if (tableBody) {
        //     tableBody.addEventListener('click', (event) => {
        //         if ((event.target as HTMLElement).classList.contains('update-btn')) {
        //             this.handleUpdateButtonClick(event);
        //         }
        //     });
        // }

        // const updateButton = document.getElementById('submit-update-btn') as HTMLButtonElement;
        // if (updateButton) {
        //     updateButton.addEventListener('click', () => this.updateProduct());
        // }
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

    // const newProduct = {
    //     name: 'New Product',
    //     description: 'A description of the new product',
    //     price: 19.99,
    //     stock: 100,
    //     categoryId: 1,
    //     imageUrl: 'http://example.com/new-product.jpg',
    //     createdAt: new Date().toISOString(),
    //     modifiedAt: new Date().toISOString(),
    // };

    private async createProduct(newProduct: Omit<Product, 'id' | 'inStock'>): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProduct),
            });
    
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
    
            const createdProduct = await response.json();
            console.log('Product created successfully:', createdProduct);
        } catch (error) {
            console.error('Error creating product: ', error);
        }
    }

    // private handleUpdateButtonClick(event: Event): void {
    //     const target = event.target as HTMLElement;
    //     const productId = target.getAttribute('data-id');
    //     if (productId) {
    //         this.fetchProductById(parseInt(productId));
    //     }
    // }

    private async fetchProductById(productId: number): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/products/${productId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }

            const productData = await response.json();

            if (productData && typeof productData === 'object') {
                this.populateUpdateForm(productData);
            } else {
                throw new Error('Invalid product data format');
            }
        } catch (error) {
            console.error('Error fetching product: ', error);
        }
    }

    private populateUpdateForm(product: Product): void {
        const updateForm = document.getElementById('update-product-form') as HTMLFormElement;
        updateForm.style.display = 'block';
        (document.getElementById('update-product-id') as HTMLInputElement).value = "" + product.id;
        (document.getElementById('update-product-name') as HTMLInputElement).value = product.name;
        (document.getElementById('update-product-description') as HTMLInputElement).value = product.description;
        (document.getElementById('update-product-price') as HTMLInputElement).value = "" + product.price;
        (document.getElementById('update-product-stock') as HTMLInputElement).value = "" + product.stock;
        (document.querySelector('.update-product-categories .categories') as HTMLSelectElement).selectedIndex = product.categoryId; //!
        (document.getElementById('update-product-imgUrl') as HTMLInputElement).value = product.imageUrl;
    }

    private async updateProduct(): Promise<void> {
        const productId = (document.getElementById('update-product-id') as HTMLInputElement).value;
        const updatedProduct = {
            name: (document.getElementById('update-product-name') as HTMLInputElement).value,
            description: (document.getElementById('update-product-description') as HTMLInputElement).value,
            price: parseFloat((document.getElementById('update-product-price') as HTMLInputElement).value),
            stock: parseInt((document.getElementById('update-product-stock') as HTMLInputElement).value),
            modifiedAt: new Date().toISOString()
        };

        try {
            const response = await fetch(`http://localhost:3000/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            const updatedProductData = await response.json();
            console.log('Product updated successfully:', updatedProductData);
            this.fetchProducts(); //! Refresh the product list
        } catch (error) {
            console.error('Error updating product: ', error);
        }
    }

    // private handleDeleteButtonClick(event: Event): void {
    //     const target = event.target as HTMLElement;
    //     const productId = target.getAttribute('data-id');
    //     if (productId) {
    //         this.showDeleteModal(parseInt(productId));
    //     }
    // }
    
    private async deleteProduct(productId: number): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            this.closeDeleteModal();
            this.products.filter(product => product.id === productId);
            this.renderProducts(this.products);
        } catch (error) {
            console.error('Error deleting product: ', error);
        }
    }

    private showNewProductForm(): void {
        const productsTable = document.getElementById('products') as HTMLTableElement;
        productsTable.style.display = 'none';
        const newProductform = document.getElementById('new-product-form') as HTMLFormElement;
        newProductform.style.display = 'flex';
    }

    private hideNewProductForm(): void {
        const productsTable = document.getElementById('products') as HTMLTableElement;
        productsTable.style.display = 'block'; // !
        const newProductform = document.getElementById('new-product-form') as HTMLFormElement;
        newProductform.style.display = 'none';
    }

    private showUpdateProductForm(): void {
        const productsTable = document.getElementById('products') as HTMLTableElement;
        productsTable.style.display = 'none';
        const updateProductform = document.getElementById('update-product-form') as HTMLFormElement;
        updateProductform.style.display = 'flex';
    }

    private hideUpdateProductForm(): void {
        const productsTable = document.getElementById('products') as HTMLTableElement;
        productsTable.style.display = 'block'; // !
        const updateProductform = document.getElementById('update-product-form') as HTMLFormElement;
        updateProductform.style.display = 'none';
    }

    private showDeleteModal(productId: number): void {
        const modal = document.getElementById('delete-modal') as HTMLDivElement;
        modal.style.display = 'block';

        const confirmButton = document.getElementById('confirm-delete-btn') as HTMLButtonElement;
        confirmButton.onclick = () => this.deleteProduct(productId);

        const closeButton = document.getElementsByClassName('close')[0] as HTMLElement;
        const cancelButton = document.getElementById('cancel-delete-btn') as HTMLButtonElement;

        closeButton.onclick = () => this.closeDeleteModal();
        cancelButton.onclick = () => this.closeDeleteModal();

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }

    private closeDeleteModal(): void {
        const modal = document.getElementById('delete-modal') as HTMLDivElement;
        modal.style.display = 'none';
    }
}

// Initialize app
new App();

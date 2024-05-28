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
    createdAt?: string;
    modifiedAt?: string;
}

export class App {
    private categories: Category[] = [];
    private products: Product[] = [];

    constructor() {
        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    }

    private async init() {
        try {
            this.products = await this.fetchProducts();
            this.renderProducts(this.products);

            this.categories = await this.fetchCategories();
            this.renderCategories();

            this.setupEventListeners();
        } catch (error) {
            console.error('Error in init function: ', error); //!
        }
    }

    private async fetchCategories(): Promise<Category[]> {
        try {
            const response = await fetch('http://localhost:3000/categories');

            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }

            const categoriesData = await response.json();

            if (Array.isArray(categoriesData) && categoriesData.every(category => typeof category === 'object')) {
                return categoriesData;
            } else {
                throw new Error('Invalid products data format');
            }
        } catch (error) {
            // console.log('Error fetching categories: ', error);
            throw error;
        }
    }

    private async fetchProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`http://localhost:3000/products`);
    
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
    
            const productsData: Product[] = await response.json();
    
            if (Array.isArray(productsData) && productsData.every(product => typeof product === 'object')) {
                return productsData;
            } else {
                throw new Error('Invalid products data format');
            }
        } catch (error) {
            // console.error('Error fetching products: ', error);
            throw error;
        }
    }

    private async fetchProductById(productId: number): Promise<Product> {
        try {
            const response = await fetch(`http://localhost:3000/products/${productId}`);
    
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
    
            const productData: Product = await response.json();
    
            if (productData && typeof productData === 'object') {
                this.populateUpdateForm(productData);
                return productData; // Return the product data
            } else {
                throw new Error('Invalid product data format');
            }
        } catch (error) {
            console.error('Error fetching product: ', error);
            throw error; // Re-throw the error to be handled by the caller if needed
        }
    }

    private fetchNewProductFormData(): Product {
        const form = document.getElementById('new-product-form') as HTMLFormElement;

        if (!form) {
            throw new Error(`New product form not found`);
        }
    
        const formData = new FormData(form);

        const product: Product = {
            id: this.products[this.products.length - 1].id + 1,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string, 10),
            categoryId: parseInt(formData.get('categoryId') as string, 10),
            imageUrl: formData.get('imgUrl') as string,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };
    
        return product;
    }

    private fetchUpdateProductFormData(): Product {
        const form = document.getElementById('update-product-form') as HTMLFormElement;

        if (!form) {
            throw new Error(`Update product form not found`);
        }
    
        const formData = new FormData(form);

        // Extracting the data-id attribute from a specific hidden input (assuming the input has an id 'hiddenInput')
        const hiddenInput = form.querySelector('input[type="hidden"][data-id]') as HTMLInputElement;
        const dataId = hiddenInput ? parseInt(hiddenInput.dataset.id as string, 10) : null;

        if (dataId === null) {
            throw new Error('Hidden input with data-id not found or invalid');
        }
    
        const product: Product = {
            id: dataId,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string, 10),
            categoryId: parseInt(formData.get('categoryId') as string, 10),
            imageUrl: formData.get('imgUrl') as string,
            modifiedAt: new Date().toISOString()
        };
    
        return product;
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
        `;

        const actionsCell = document.createElement('td');

        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'update';
        updateBtn.id = 'update-product-btn';
        updateBtn.dataset.id = "" + product.id;
        updateBtn.addEventListener('click', () => {
            if (product.id) {
                this.showUpdateProductForm(product.id);
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'delete';
        deleteBtn.id = 'delete-product-btn';
        deleteBtn.dataset.id = "" + product.id;
        deleteBtn.addEventListener('click', () => {
            if (product.id) {
                this.showDeleteModal(product.id);
            }
        });

        actionsCell.appendChild(updateBtn);
        actionsCell.appendChild(deleteBtn);

        row.appendChild(actionsCell);

        return row;
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

    private async createProduct(product: Product): Promise<Product> {
        try {
            const response = await fetch(`http://localhost:3000/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });
    
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
    
            const createdProduct: Product = await response.json();
    
            if (createdProduct && typeof createdProduct === 'object') {
                this.products.push(product);
                // this.renderProducts(this.products);
                return createdProduct;
            } else {
                throw new Error('Invalid product data format');
            }
        } catch (error) {
            // console.error('Error creating product: ', error);
            throw error;
        }
    }

    private async updateProduct(product: Product): Promise<Product> {
        try {
            const response = await fetch(`http://localhost:3000/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }
            
            const updatedProductData = await response.json();

            if (updatedProductData && typeof updatedProductData === 'object') {
                // Update the this.products array
                this.products = this.products.map(p =>
                    p.id === product.id ? updatedProductData : p
                );
                // this.renderProducts(this.products);

                return updatedProductData;
            } else {
                throw new Error('Invalid product data format');
            }
        } catch (error) {
            // console.error('Error updating product: ', error);
            throw error;
        }
    }

    private async deleteProduct(productId: number): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/products/${productId}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            
            // this.products.filter(product => product.id === productId);
            this.products = this.products.filter(product => product.id !== productId);
            // this.renderProducts(this.products);
        } catch (error) {
            // console.error('Error deleting product: ', error);
            throw error;
        }
    }

    private showNewProductForm(): void {
        const productsTable = document.getElementById('products') as HTMLTableElement;
        productsTable.style.display = 'none';

        const newProductform = document.getElementById('new-product-form') as HTMLFormElement;
        newProductform.style.display = 'flex';

        const newProductSubmitBtn = document.getElementById('new-product-submit-btn') as HTMLButtonElement;
        newProductSubmitBtn.addEventListener('click', () => {
            const product = this.fetchNewProductFormData();
            this.createProduct(product);
            this.hideNewProductForm();
            this.renderProducts(this.products); // !
        }); 
        
        const newProductCancelBtn = document.getElementById('new-product-cancel-btn') as HTMLButtonElement;
        newProductCancelBtn.addEventListener('click', () => {
            this.hideNewProductForm();
        });
    }

    private hideNewProductForm(): void {
        const productsTable = document.getElementById('products') as HTMLTableElement;
        productsTable.style.display = 'block'; // !
        const newProductform = document.getElementById('new-product-form') as HTMLFormElement;
        newProductform.style.display = 'none';
    }

    private showUpdateProductForm(productId: number): void {
        const productsTable = document.getElementById('products') as HTMLTableElement;
        productsTable.style.display = 'none';

        const updateProductform = document.getElementById('update-product-form') as HTMLFormElement;
        updateProductform.style.display = 'flex';

        const hiddenInput = document.querySelector('#update-product-form input[type="hidden"]') as HTMLInputElement;
        hiddenInput.dataset.id = "" + productId;

        const updateProductSubmitBtn = document.getElementById('update-product-submit-btn') as HTMLButtonElement;
        updateProductSubmitBtn.addEventListener('click', () => {
            const product = this.fetchUpdateProductFormData();
            this.updateProduct(product);
            this.hideUpdateProductForm();
            this.renderProducts(this.products); // !
        });
        
        const updateProductCancelBtn = document.getElementById('update-product-cancel-btn') as HTMLButtonElement;
        updateProductCancelBtn.addEventListener('click', () => {
            this.hideUpdateProductForm();
        });
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
        // confirmButton.onclick = () => this.deleteProduct(productId);
        confirmButton.addEventListener('click', () => {
            this.deleteProduct(productId);
            this.closeDeleteModal();
            this.renderProducts(this.products); // !
        });

        const closeButton = document.getElementsByClassName('close')[0] as HTMLElement;
        const cancelButton = document.getElementById('cancel-delete-btn') as HTMLButtonElement;

        closeButton.onclick = () => this.closeDeleteModal();
        cancelButton.onclick = () => this.closeDeleteModal();
    }

    private closeDeleteModal(): void {
        const modal = document.getElementById('delete-modal') as HTMLDivElement;
        modal.style.display = 'none';
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
        
        // const newProductSubmitBtn = document.getElementById('new-product-submit-btn') as HTMLButtonElement;
        // newProductSubmitBtn.addEventListener('click', () => {
        //     const product = this.fetchNewProductFormData();
        //     this.createProduct(product);
        //     this.hideNewProductForm();
        // }); 
        
        // const newProductCancelBtn = document.getElementById('new-product-cancel-btn') as HTMLButtonElement;
        // newProductCancelBtn.addEventListener('click', () => {
        //     this.hideNewProductForm();
        // });

        // const updateProductBtn = document.getElementById('update-product-btn') as HTMLButtonElement;
        // updateProductBtn?.addEventListener('click', () => {
        //     this.showUpdateProductForm();
        // });
        
        // const updateProductSubmitBtn = document.getElementById('update-product-submit-btn') as HTMLButtonElement;
        // updateProductSubmitBtn.addEventListener('click', () => {
        //     const product = this.fetchUpdateProductFormData();
        //     this.updateProduct(product);
        //     this.hideUpdateProductForm();
        // });
        
        // const updateProductCancelBtn = document.getElementById('update-product-cancel-btn') as HTMLButtonElement;
        // updateProductCancelBtn?.addEventListener('click', () => {
        //     this.hideUpdateProductForm();
        // });

        // const deleteProductBtn = document.getElementById('delete-product-btn') as HTMLButtonElement;
        // const productId = deleteProductBtn.getAttribute('data-id');
        // deleteProductBtn?.addEventListener('click', () => {
        //     if (productId) {
        //         this.showDeleteModal(parseInt(productId));
        //     }
        // });

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
    }
}

// Initialize app
new App();

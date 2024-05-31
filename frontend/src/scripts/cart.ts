// Define cart Item interface
interface CartItem {
    cartItemId: string,
    productId: string,
    productName: string,
    unitPrice: number,
    quantity: number,
    totalPrice: number,
    userId: string
}

export class App {
    private cartItems: CartItem[] = [];

    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    private async init(): Promise<void> {
        await this.fetchCartItems();
        this.displayCartItems(this.cartItems);
        this.displayCartItemsCount(); //!
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
                    cartItemId: cartItem.cartItemId,
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

        if (itemCount) {
            cartCountSpan.textContent = itemCount.toString();
        } else {
            cartCountSpan.textContent = "0";
        }
    }

    private displayCartItems(cartItems: CartItem[]): void {
        const cartTableBody = document.getElementById('cart-items')?.querySelector('tbody') as HTMLElement;
        cartTableBody.innerHTML = ''; // Clear existing rows
    
        cartItems.forEach(cartItem => {
            const row = document.createElement('tr');
    
            // Create product name cell
            const productNameCell = document.createElement('td');
            productNameCell.textContent = cartItem.productName;
            row.appendChild(productNameCell);
    
            // Create unit price cell
            const unitPriceCell = document.createElement('td');
            unitPriceCell.textContent = `$${cartItem.unitPrice}`; // ! toFixed(2)
            row.appendChild(unitPriceCell);
    
            // Create quantity cell with buttons
            const quantityCell = document.createElement('td');
            
            const decreaseButton = document.createElement('button');
            decreaseButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
            decreaseButton.onclick = () => this.updateQuantity(cartItem.cartItemId, -1);
            quantityCell.appendChild(decreaseButton);
            
            const quantitySpan = document.createElement('span');
            quantitySpan.id = `quantity-${cartItem.cartItemId}`;
            quantitySpan.textContent = cartItem.quantity.toString();
            quantityCell.appendChild(quantitySpan);
            
            const increaseButton = document.createElement('button');
            increaseButton.innerHTML = '<i class="fa-solid fa-minus"></i>';
            increaseButton.onclick = () => this.updateQuantity(cartItem.cartItemId, 1);
            quantityCell.appendChild(increaseButton);
            
            row.appendChild(quantityCell);
    
            // Create total price cell
            const totalPriceCell = document.createElement('td');
            totalPriceCell.id = `totalPrice-${cartItem.cartItemId}`;
            totalPriceCell.textContent = `$${cartItem.totalPrice}`; // ! toFixed(2)
            row.appendChild(totalPriceCell);

            // Actions cell
            const actionsCell = document.createElement('td');
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'remove';
            deleteButton.classList.add('remove-item-btn');
            // ! deleteButton.dataset.id = "" + cartItem.cartItemId;
            deleteButton.onclick = () => this.removeFromCart(cartItem.cartItemId); //!
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);
    
            // Append row to table body
            cartTableBody.appendChild(row);
        });
    }

    private async updateQuantity(cartItemId: string, change: number): Promise<void> {
        const quantitySpan = document.getElementById(`quantity-${cartItemId}`) as HTMLSpanElement;

        let newQuantity = parseInt(""+ quantitySpan.textContent) + change; // ! ""+
    
        if (newQuantity < 1) {
            newQuantity = 1; // Ensure the quantity is at least 1
        }
    
        // Update the quantity in the backend
        try {
            const response = await fetch(`http://localhost:3000/cartItems/${cartItemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
    
            if (!response.ok) {
                throw new Error('Failed to update cart item quantity');
            }
    
            // Update the quantity and total price in the UI
            const cartItem = await response.json();
            quantitySpan.textContent = cartItem.quantity.toString();
            this.updateTotalPrice(cartItemId, cartItem.unitPrice, cartItem.quantity);
        } catch (error) {
            console.error('Error updating cart item quantity: ', error);
        }
    }

    private updateTotalPrice(cartItemId: string, unitPrice: number, quantity: number): void {
        const totalPrice = unitPrice * quantity;
        const totalPriceElement = document.getElementById(`totalPrice-${cartItemId}`) as HTMLTableCellElement;
        totalPriceElement.textContent = `$${totalPrice}`; // ! toFixed(2)
    }

    private async removeFromCart(cartItemId: string): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/cartItem/${cartItemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete cart item');
            }

            this.cartItems = this.cartItems.filter(cartItem => cartItem.cartItemId !== cartItemId);
            this.displayCartItems(this.cartItems);
        } catch (error) {
            // console.error('Error deleting cart item: ', error);
            throw error;
        }
    }

    private showOrderCreatedModal(): void {
        const modal = document.getElementById('order-created-modal') as HTMLDivElement;
        modal.style.display = 'block';

        const closeButton = document.getElementById('close-order-created-modal-btn') as HTMLElement;

        closeButton.onclick = () => this.closeOrderCreatedModal();
    }

    private closeOrderCreatedModal(): void {
        const modal = document.getElementById('order-created-modal') as HTMLDivElement;
        modal.style.display = 'none';
    }
}

// Initialize app
new App();

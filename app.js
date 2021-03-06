//Variables
const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDom = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDom = document.querySelector('.products-center')


// Cart
let cart = []

//buttons
let buttonsDOM = []

// getting products
class Products {

    async getProducts() {
        try {
            let result = await fetch('./products.json')
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields
                const {
                    id
                } = item.sys
                const image = item.fields.image.fields.file.url;

                return {
                    title,
                    price,
                    id,
                    image
                }
            })
            return products
        } catch {
            console.log(error)
        }
    }
}

// display products
class Ui {
    //Fetch data from json file and display data
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <!-- single-Products start -->
                        <article class = "product" >
                            <div class = "img-container" >
                            <img src= ${product.image} class = "product-img" alt = "" >
                            <button class = "bag-btn" data-id =${product.id} >
                            <i class = "fas fa-shopping-cart"> </i>add to bag 
                            </button>
                            </div> 
                            <h3>${product.title}</h3>
                            <h4>${product.price}</h4>
                            </article> 
            <!--single - Products End -->
            `
        })
        productsDom.innerHTML = result
    }


    getBagButton() {
        let buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart"
                event.target.disabled = true

                // get product from products
                let cartItem = {
                    ...Storage.getProduct(id),
                    amount: 1
                }
                // add product to the cart
                cart = [...cart, cartItem]
                // save cart in local storage
                Storage.saveCart(cart)
                // set cart value
                this.setCartValue(cart)
                // display cart item
                this.addCartItem(cartItem)
                // show the cart
                this.showCart()
            })

        })
    }

    setCartValue(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;

    }

    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add('cart-item');
        div.innerHTML = `
             <img src=${item.image} alt="">
              <div>
                <h4>${item.title}</h4> 
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id="${item.id}">remove</span>
              </div>
              <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
              </div>`;
        cartContent.appendChild(div)
    }

    //Show side bar
    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDom.classList.add('showCart')
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDom.classList.remove('showCart')
    }

    //After load bring previous product if available in local storage
    setUpApp() {
        cart = Storage.getCart()
        this.setCartValue(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    //Take product from local storage and set into cart view
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item))
    }

    //cart functionality

    //Increase and decrease item count
    clearCart() {
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })
        cartContent.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id
                this.removeItem(id);
                //remove from dom
                cartContent.removeChild(removeItem.parentElement.parentElement);
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount + 1;
                //Update amount in local storage
                Storage.saveCart(cart)
                //update total
                this.setCartValue(cart)
                //Update amount number
                addAmount.nextElementSibling.innerText = tempItem.amount

            } else if (event.target.classList.contains('fa-chevron-down')) {

                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1;

                if (tempItem.amount > 0) {
                    Storage.saveCart(cart)
                    this.setCartValue(cart)
                    lowerAmount.previousElementSibling.innerText = tempItem.amount
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }

            }
        })
    }






    //Remove item from cart
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSignInButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }
    getSignInButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }



}

// Local Storage
class Storage {
    static saveProduct(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)

    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }

    static getCart(id) {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }


}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new Ui();
    const products = new Products();

    //SetUp Application
    ui.setUpApp()

    //Get all products
    products.getProducts().then((products) => {
            ui.displayProducts(products);
            Storage.saveProduct(products);
        }).then(() => {
            ui.getBagButton()
            //For increment and decrement number of product
            ui.cartLogic()
        })
        .catch((error) => {
            console.log(error)
        })

})
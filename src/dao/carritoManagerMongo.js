import { Cart } from './models/carrito.model.js';
import { ProductEsquema } from './models/products.model.js';

class CarritoManager {
    
    async createEmptyCart() {
        try {
            const newCart = new Cart({});
            
            const existingCart = await Cart.findById(newCart._id);
            if (existingCart) {
                console.log('Ya existe un carrito con este ID:', newCart._id);
                return existingCart;
            }

            await newCart.save();
            return newCart;
        } catch (error) {
            console.error("Error al crear un carrito vacío:", error);
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            return await Cart.findById({_id: cartId}).populate('items.product').lean();
        } catch (error) {
            console.error("Error al obtener el carrito por ID:", error);
            throw error;
        }
    }
    
    async addProductToCart(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);
        
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }
        
            const product = await ProductEsquema.findById(productId);
        
            if (!product) {
                throw new Error('Producto no encontrado.');
            }
        
            const existingItemIndex = cart.items.findIndex(item => item.product.equals(productId));
        
            if (existingItemIndex !== -1) {
                // El producto ya existe en el carrito, actualiza la cantidad
                cart.items[existingItemIndex].quantity += quantity || 1;
            } else {
                // El producto no existe en el carrito, agrégalo con la cantidad proporcionada o 1 por defecto
                cart.items.push({
                    product: productId,
                    quantity: quantity || 1,
                });
            }
        
            // Llama a save para aplicar los cambios en la base de datos
            await cart.save();
        
            const updatedCart = await Cart.findById(cartId);
            return updatedCart;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error;
        }
    }

    async deleteProductToCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
        
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }
        
            const existingItemIndex = cart.items.findIndex(item => item.product.equals(productId));
        
            if (existingItemIndex !== -1) {
                // Elimina el producto del array de items
                cart.items.splice(existingItemIndex, 1);
            } else {
                throw new Error('Producto no encontrado en el carrito.');
            }
        
            // Llama a save para aplicar los cambios en la base de datos
            await cart.save();
        
            const updatedCart = await Cart.findById(cartId);
            return updatedCart;
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            throw error;
        }
    }

    async deleteCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
        
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }
        
            // Elimina el carrito directamente
            await Cart.findByIdAndDelete(cartId);
        
            // Retorna el carrito eliminado
            return `Carrito ${cartId} eliminado`;
        } catch (error) {
            console.error('Error al eliminar el carrito:', error);
            throw error;
        }
    }
}

export default CarritoManager;
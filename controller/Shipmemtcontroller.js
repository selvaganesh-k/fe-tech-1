// controllers/ShipmentController.js
const Shipment = require('../model/Shipmentmodel');
const OrderItem = require('../model/OrderItemModel');
const Product = require('../model/Productmodel');
const Order = require('../model/Ordermodel');

exports.createShipments = async (req, res) => {
    try {
        const { order_id, product_id, quantity, price, dispatch_date, dispatch_address, transport } = req.body;

        // Check if order exists
        const order = await Order.findOne({ where: { order_id } });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const shipments = []; // Array to hold all shipment promises

        for (let i = 0; i < product_id.length; i++) {
            // Check if the product is part of the order
            const orderItem = await OrderItem.findOne({ where: { order_id, product_id: product_id[i] } });
            if (!orderItem) {
                return res.status(400).json({ error: `Product ${product_id[i]} is not part of the order` });
            }

            // Prepare shipment object
            const shipmentData = {
                shipment_id: req.shipment_id, // Ensure this is set by your middleware
                order_id: order_id,
                distributor_name: orderItem.product.distributor_name,
                product_name: orderItem.product.product_name,
                quantity: quantity[i],
                price: price[i],
                dispatch_date: dispatch_date[i],
                dispatch_address: dispatch_address[i],
                transport: transport[i],
            };

            // Create shipment and add to the promises array
            const shipmentPromise = Shipment.create(shipmentData);
            shipments.push(shipmentPromise);
        }

        // Wait for all shipment promises to resolve
        await Promise.all(shipments);

        res.status(201).json({
            message: 'Shipments created successfully'
        });

    } catch (error) {
        console.error('Error creating shipments:', error);
        res.status(500).json({ error: 'Failed to create shipments', details: error.message });
    }
};

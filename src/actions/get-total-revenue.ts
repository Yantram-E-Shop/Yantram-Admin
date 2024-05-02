export const getTotalRevenue = async (): Promise<number> => {
    // Sample data for demonstration
    const paidOrders = [
      {
        orderItems: [
          { product: { price: 100 } }, // Assuming product price is 100 for this order item
          { product: { price: 50 } }, // Assuming product price is 50 for this order item
        ],
      },
      {
        orderItems: [
          { product: { price: 80 } },
          { product: { price: 70 } },
        ],
      },
      // Add more sample orders as needed
    ];
  
    // Calculating total revenue from sample data
    const totalRevenue = paidOrders.reduce((total, order) => {
      const orderTotal = order.orderItems.reduce((orderSum, item) => {
        return orderSum + item.product.price;
      }, 0);
      return total + orderTotal;
    }, 0);
  
    return totalRevenue;
  };
  
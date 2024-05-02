export const getSalesCount = async (): Promise<number> => {
    // Simulating the count of paid orders
    // You can replace this with actual sample data
    const sampleData = [
      { isPaid: true },
      { isPaid: true },
      { isPaid: true },
      { isPaid: false }, // Assuming this order is not paid
      // Add more sample data as needed
    ];
  
    // Counting the number of paid orders
    const salesCount = sampleData.filter(order => order.isPaid).length;
  
    return salesCount;
  };
  